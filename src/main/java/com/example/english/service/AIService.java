package com.example.english.service;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.vosk.LibVosk;
import org.vosk.Model;
import org.vosk.Recognizer;
import reactor.core.publisher.Mono;

import java.io.InputStream;
import java.math.BigDecimal;
import java.net.URI;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

/**
 * AI Service for NLP features: pronunciation scoring, grammar checking, spell
 * checking
 * Hiện tại được nâng cấp để:
 * - Sử dụng Vosk cho việc nhận dạng tiếng nói và chấm điểm phát âm (offline)
 * - Vẫn giữ các hàm mock cho grammar/spelling để có feedback cơ bản
 */
@Service
public class AIService {

    private final WebClient webClient;

    // Vosk model (có thể null nếu chưa cấu hình đúng)
    private final Model voskModel;

    // Thư mục lưu file upload (webm/mp3/wav)
    private final String uploadDir;

    private final String geminiApiKey;
    private final String geminiApiUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public AIService(
            @Value("${vosk.model.path:models/vosk-model-small-en-us-0.15}") String voskModelPath,
            @Value("${app.upload.dir:uploads}") String uploadDir,
            @Value("${google.gemini.api.key}") String geminiApiKey,
            @Value("${google.gemini.api.url}") String geminiApiUrl) {
        this.webClient = WebClient.builder()
                .build();

        this.uploadDir = uploadDir;
        this.geminiApiKey = geminiApiKey;
        this.geminiApiUrl = geminiApiUrl;

        Model loadedModel = null;
        try {
            // Có thể giảm log Vosk nếu cần, nhưng không bắt buộc
            Path modelPath = Paths.get(voskModelPath);
            if (Files.exists(modelPath)) {
                loadedModel = new Model(voskModelPath);
            } else {
                System.err.println("Vosk model not found at path: " + voskModelPath +
                        ". Pronunciation scoring will fall back to mock implementation.");
            }
        } catch (Exception e) {
            System.err.println("Failed to load Vosk model: " + e.getMessage());
        }
        this.voskModel = loadedModel;
    }

    // ====== PRONUNCIATION / SPEECH ======

    /**
     * Phân tích phát âm bằng Vosk.
     * Nếu không có model hoặc file audio, sẽ fallback về thuật toán mock dựa trên
     * text.
     */
    public PronunciationAnalysis analyzePronunciation(String expectedText, String audioFileUrl) {
        expectedText = expectedText != null ? expectedText.trim() : "";

        // Nếu không có Vosk model hoặc không có audio, dùng mock
        if (voskModel == null || audioFileUrl == null || audioFileUrl.trim().isEmpty()) {
            BigDecimal mockScore = mockPronunciationScore(expectedText);
            return new PronunciationAnalysis(
                    mockScore,
                    expectedText,
                    expectedText, // giả sử nói đúng
                    Collections.emptyList());
        }

        try {
            Path audioPath = resolveAudioPath(audioFileUrl);
            if (!Files.exists(audioPath)) {
                BigDecimal mockScore = mockPronunciationScore(expectedText);
                return new PronunciationAnalysis(
                        mockScore,
                        expectedText,
                        "",
                        Collections.emptyList());
            }

            String recognizedText = recognizeTextFromAudio(audioPath);
            if (recognizedText == null) {
                recognizedText = "";
            }

            PronunciationAnalysis analysis = compareTexts(expectedText, recognizedText);
            return analysis;
        } catch (Exception e) {
            System.err.println("Error during Vosk pronunciation analysis: " + e.getMessage());
            BigDecimal mockScore = mockPronunciationScore(expectedText);
            return new PronunciationAnalysis(
                    mockScore,
                    expectedText,
                    "",
                    Collections.emptyList());
        }
    }

    /**
     * Hàm cũ trả về BigDecimal score, giữ lại để tương thích.
     * Bên trong dùng analyzePronunciation.
     */
    public BigDecimal scorePronunciation(String text, String audioFileUrl) {
        PronunciationAnalysis analysis = analyzePronunciation(text, audioFileUrl);
        return analysis.getScore();
    }

    private Path resolveAudioPath(String audioFileUrl) {
        // audioFileUrl thường có dạng /api/files/audio/{filename} hoặc chỉ là filename
        String pathPart = audioFileUrl.trim();
        int lastSlash = pathPart.lastIndexOf('/');
        if (lastSlash >= 0) {
            pathPart = pathPart.substring(lastSlash + 1);
        }
        return Paths.get(uploadDir).resolve(pathPart).normalize();
    }

    /**
     * Dùng Vosk để nhận dạng text từ file audio.
     * Yêu cầu audio PCM 16kHz mono (nên convert trước bằng ffmpeg).
     */
    private String recognizeTextFromAudio(Path audioPath) throws Exception {
        if (voskModel == null) {
            return "";
        }

        try (Recognizer recognizer = new Recognizer(voskModel, 16000);
                InputStream is = Files.newInputStream(audioPath)) {

            byte[] buffer = new byte[4096];
            int nread;
            while ((nread = is.read(buffer)) >= 0) {
                if (recognizer.acceptWaveForm(buffer, nread)) {
                    // Có thể đọc intermediate result nếu cần
                }
            }

            String resultJson = recognizer.getFinalResult();
            if (resultJson == null || resultJson.isEmpty()) {
                return "";
            }

            JsonNode node = objectMapper.readTree(resultJson);
            JsonNode textNode = node.get("text");
            return textNode != null ? textNode.asText() : "";
        }
    }

    /**
     * So sánh expectedText và recognizedText để tính điểm & danh sách từ chi tiết.
     */
    private PronunciationAnalysis compareTexts(String expectedText, String recognizedText) {
        List<String> expectedWords = tokenize(expectedText);
        List<String> actualWords = tokenize(recognizedText);

        if (expectedWords.isEmpty()) {
            return new PronunciationAnalysis(BigDecimal.ONE, expectedText, recognizedText, Collections.emptyList());
        }

        List<WordDetail> details = new ArrayList<>();
        int matchCount = 0;
        int lastFoundIndex = -1;

        for (String word : expectedWords) {
            boolean found = false;
            // Tìm từ trong actualWords sau vị trí đã tìm thấy trước đó để giữ thứ tự
            for (int i = lastFoundIndex + 1; i < actualWords.size(); i++) {
                if (actualWords.get(i).equals(word)) {
                    lastFoundIndex = i;
                    found = true;
                    break;
                }
            }

            if (found) {
                matchCount++;
                details.add(new WordDetail(word, "correct"));
            } else {
                // Kiểm tra xem có từ nào "gần giống" không (dự đoán)
                boolean nearMatch = false;
                for (int i = lastFoundIndex + 1; i < actualWords.size(); i++) {
                    if (isNearMatch(word, actualWords.get(i))) {
                        lastFoundIndex = i;
                        nearMatch = true;
                        break;
                    }
                }

                if (nearMatch) {
                    details.add(new WordDetail(word, "fair"));
                    matchCount++; // Đếm là match nhưng status là fair
                } else {
                    details.add(new WordDetail(word, "incorrect"));
                }
            }
        }

        double scoreValue = (double) matchCount / expectedWords.size();

        return new PronunciationAnalysis(
                BigDecimal.valueOf(scoreValue).setScale(2, RoundingMode.HALF_UP),
                expectedText,
                recognizedText,
                details);
    }

    private boolean isNearMatch(String s1, String s2) {
        if (s1.length() < 3 || s2.length() < 3)
            return false;
        int dist = levenshteinDistance(Arrays.asList(s1.split("")), Arrays.asList(s2.split("")));
        return dist <= 1; // Rất gần (ví dụ: thiếu 1 ký tự hoặc sai 1 ký tự)
    }

    private List<String> tokenize(String text) {
        if (text == null || text.trim().isEmpty()) {
            return Collections.emptyList();
        }
        String[] parts = text.toLowerCase().replaceAll("[^a-z\\s]", " ").split("\\s+");
        List<String> words = new ArrayList<>();
        for (String p : parts) {
            if (!p.isEmpty()) {
                words.add(p);
            }
        }
        return words;
    }

    private int levenshteinDistance(List<String> a, List<String> b) {
        int n = a.size();
        int m = b.size();
        int[][] dp = new int[n + 1][m + 1];

        for (int i = 0; i <= n; i++)
            dp[i][0] = i;
        for (int j = 0; j <= m; j++)
            dp[0][j] = j;

        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                int cost = a.get(i - 1).equals(b.get(j - 1)) ? 0 : 1;
                dp[i][j] = Math.min(
                        Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                        dp[i - 1][j - 1] + cost);
            }
        }
        return dp[n][m];
    }

    private BigDecimal mockPronunciationScore(String text) {
        if (text == null || text.trim().isEmpty()) {
            return BigDecimal.ZERO;
        }
        double baseScore = 0.7;
        int length = text.length();
        if (length < 20) {
            baseScore += 0.1;
        } else if (length > 50) {
            baseScore -= 0.1;
        }
        double variation = (Math.random() * 0.2) - 0.1;
        double finalScore = Math.max(0.0, Math.min(1.0, baseScore + variation));
        return BigDecimal.valueOf(finalScore).setScale(2, RoundingMode.HALF_UP);
    }

    // ====== GRAMMAR & SPELLING (mock như cũ) ======

    /**
     * Check grammar errors in text
     * Returns list of grammar errors with suggestions
     */
    public List<Map<String, String>> checkGrammar(String text) {
        List<Map<String, String>> errors = new ArrayList<>();

        if (text == null || text.trim().isEmpty()) {
            return errors;
        }

        String[] words = text.split("\\s+");

        for (int i = 0; i < words.length - 1; i++) {
            String current = words[i].toLowerCase().replaceAll("[^a-z]", "");
            String next = words[i + 1].toLowerCase().replaceAll("[^a-z]", "");

            if (current.equals("a") && next.matches("^[aeiou].*")) {
                Map<String, String> error = new HashMap<>();
                error.put("type", "article");
                error.put("message", "Use 'an' instead of 'a' before words starting with a vowel");
                error.put("offset", String.valueOf(i));
                error.put("length", "1");
                error.put("suggestion", "an");
                errors.add(error);
            }
        }

        return errors;
    }

    /**
     * Check spelling errors in text
     * Returns list of spelling errors with suggestions
     */
    public List<Map<String, String>> checkSpelling(String text) {
        List<Map<String, String>> errors = new ArrayList<>();

        if (text == null || text.trim().isEmpty()) {
            return errors;
        }

        Map<String, String> commonMistakes = new HashMap<>();
        commonMistakes.put("recieve", "receive");
        commonMistakes.put("seperate", "separate");
        commonMistakes.put("occured", "occurred");
        commonMistakes.put("teh", "the");
        commonMistakes.put("adn", "and");

        String[] words = text.split("\\s+");
        int offset = 0;

        for (String word : words) {
            String cleanWord = word.toLowerCase().replaceAll("[^a-z]", "");

            if (commonMistakes.containsKey(cleanWord)) {
                Map<String, String> error = new HashMap<>();
                error.put("type", "spelling");
                error.put("message", "Spelling error: '" + word + "'");
                error.put("offset", String.valueOf(offset));
                error.put("length", String.valueOf(word.length()));
                error.put("suggestion", commonMistakes.get(cleanWord));
                errors.add(error);
            }

            offset += word.length() + 1;
        }

        return errors;
    }

    /**
     * Generate AI response for conversation using Gemini API
     */
    public String generateAIResponse(String userMessage, String context) {
        String systemPrompt = "You are an English tutor helping students practice speaking. Be friendly, encouraging, and keep your responses concise (2-3 sentences max). Topic: "
                + context;
        String prompt = systemPrompt + "\n\nUser: " + userMessage + "\n\nAssistant:";

        return callGemini(prompt);
    }

    /**
     * Translate text to Vietnamese using Gemini API
     */
    public String translateText(String text) {
        if (text == null || text.trim().isEmpty())
            return "";
        String prompt = "Translate the following English text to Vietnamese. Return ONLY the translation, no extra comments:\n\n"
                + text;
        return callGemini(prompt);
    }

    private String callGemini(String prompt) {
        try {
            Map<String, Object> part = Map.of("text", prompt);
            Map<String, Object> content = Map.of("parts", List.of(part));
            Map<String, Object> body = Map.of("contents", List.of(content));

            System.out.println("Calling Gemini API: " + geminiApiUrl);

            String url = geminiApiUrl + "?key=" + geminiApiKey;

            String response = webClient.post()
                    .uri(URI.create(url))
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .onStatus(status -> status.isError(),
                            clientResponse -> clientResponse.bodyToMono(String.class).flatMap(errorBody -> {
                                String errorMsg = "Gemini API Error: " + clientResponse.statusCode() + " - "
                                        + errorBody;
                                System.err.println(errorMsg);
                                return Mono.error(new RuntimeException(errorMsg));
                            }))
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(response);
            return root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
        } catch (Exception e) {
            String errorDetail = e.getMessage();
            System.err.println("Exception in callGemini: " + errorDetail);
            e.printStackTrace();
            return "AI Error: " + (errorDetail != null ? errorDetail : "Unknown connection error");
        }
    }

    /**
     * Analyze text and provide feedback
     */
    public Map<String, Object> analyzeText(String text) {
        Map<String, Object> analysis = new HashMap<>();

        List<Map<String, String>> grammarErrors = checkGrammar(text);
        List<Map<String, String>> spellingErrors = checkSpelling(text);

        analysis.put("grammarErrors", grammarErrors);
        analysis.put("spellingErrors", spellingErrors);
        analysis.put("grammarErrorCount", grammarErrors.size());
        analysis.put("spellingErrorCount", spellingErrors.size());

        int totalErrors = grammarErrors.size() + spellingErrors.size();
        int wordCount = text.split("\\s+").length;
        double errorRate = wordCount > 0 ? (double) totalErrors / wordCount : 0.0;
        double qualityScore = Math.max(0.0, Math.min(1.0, 1.0 - (errorRate * 2)));

        analysis.put("qualityScore", BigDecimal.valueOf(qualityScore).setScale(2, RoundingMode.HALF_UP));
        analysis.put("wordCount", wordCount);

        return analysis;
    }

    /**
     * Cung cấp phản hồi thông minh về câu và phát âm bằng tiếng Việt.
     */
    public String getSmartSpeechFeedback(String text, List<WordDetail> details) {
        StringBuilder mispronouncedInfo = new StringBuilder();
        if (details != null) {
            for (WordDetail detail : details) {
                if (!"correct".equals(detail.getStatus())) {
                    mispronouncedInfo.append(detail.getWord()).append(" (").append(detail.getStatus()).append("), ");
                }
            }
        }

        String prompt = "Phân tích câu nói tiếng Anh: \"" + text + "\".\n" +
                "Các từ phát âm chưa chuẩn: " + mispronouncedInfo.toString() + "\n\n" +
                "Yêu cầu (viết bằng tiếng Việt, cực kỳ ngắn gọn, định dạng bullet point):\n" +
                "- Nhận xét nhanh về ngữ pháp (chỉ ghi nếu có lỗi).\n" +
                "- Chỉ dẫn mẹo phát âm cho các từ lỗi (1 dòng/từ).\n" +
                "- Một câu động viên ngắn.\n\n" +
                "Lưu ý: Không dùng bảng, không viết dài dòng.";

        return callGemini(prompt);
    }

    /**
     * Kết quả phân tích phát âm chi tiết.
     */
    public static class PronunciationAnalysis {
        private final BigDecimal score;
        private final String expectedText;
        private final String recognizedText;
        private final List<WordDetail> details;

        public PronunciationAnalysis(BigDecimal score, String expectedText, String recognizedText,
                List<WordDetail> details) {
            this.score = score;
            this.expectedText = expectedText;
            this.recognizedText = recognizedText;
            this.details = details;
        }

        public BigDecimal getScore() {
            return score;
        }

        public String getExpectedText() {
            return expectedText;
        }

        public String getRecognizedText() {
            return recognizedText;
        }

        public List<WordDetail> getDetails() {
            return details;
        }

        // For backward compatibility
        public List<String> getMispronouncedWords() {
            return details.stream()
                    .filter(d -> !"correct".equals(d.getStatus()))
                    .map(WordDetail::getWord)
                    .toList();
        }
    }

    public static class WordDetail {
        private final String word;
        private final String status; // correct, fair, incorrect

        @JsonCreator
        public WordDetail(
                @JsonProperty("word") String word,
                @JsonProperty("status") String status) {
            this.word = word;
            this.status = status;
        }

        public String getWord() {
            return word;
        }

        public String getStatus() {
            return status;
        }
    }
}

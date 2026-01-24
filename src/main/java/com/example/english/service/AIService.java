package com.example.english.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.vosk.LibVosk;
import org.vosk.Model;
import org.vosk.Recognizer;

import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

/**
 * AI Service for NLP features: pronunciation scoring, grammar checking, spell checking
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

    private final ObjectMapper objectMapper = new ObjectMapper();

    public AIService(
            @Value("${vosk.model.path:models/vosk-model-small-en-us-0.15}") String voskModelPath,
            @Value("${app.upload.dir:uploads}") String uploadDir
    ) {
        this.webClient = WebClient.builder()
                .baseUrl("https://api.example.com") // Reserved cho tương lai nếu cần gọi API ngoài
                .build();

        this.uploadDir = uploadDir;

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
     * Nếu không có model hoặc file audio, sẽ fallback về thuật toán mock dựa trên text.
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
                    Collections.emptyList()
            );
        }

        try {
            Path audioPath = resolveAudioPath(audioFileUrl);
            if (!Files.exists(audioPath)) {
                BigDecimal mockScore = mockPronunciationScore(expectedText);
                return new PronunciationAnalysis(
                        mockScore,
                        expectedText,
                        "",
                        Collections.emptyList()
                );
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
                    Collections.emptyList()
            );
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
     * So sánh expectedText và recognizedText để tính điểm & danh sách từ chưa chuẩn.
     */
    private PronunciationAnalysis compareTexts(String expectedText, String recognizedText) {
        List<String> expectedWords = tokenize(expectedText);
        List<String> actualWords = tokenize(recognizedText);

        if (expectedWords.isEmpty()) {
            return new PronunciationAnalysis(BigDecimal.ONE, expectedText, recognizedText, Collections.emptyList());
        }

        int distance = levenshteinDistance(expectedWords, actualWords);
        double wer = (double) distance / expectedWords.size(); // Word Error Rate
        double scoreValue = Math.max(0.0, Math.min(1.0, 1.0 - wer));

        // Xác định các từ "chưa chuẩn" đơn giản: từ expected không xuất hiện trong actual
        Set<String> actualSet = new HashSet<>(actualWords);
        List<String> mispronounced = new ArrayList<>();
        for (String w : expectedWords) {
            if (!actualSet.contains(w) && !mispronounced.contains(w)) {
                mispronounced.add(w);
            }
        }

        return new PronunciationAnalysis(
                BigDecimal.valueOf(scoreValue).setScale(2, RoundingMode.HALF_UP),
                expectedText,
                recognizedText,
                mispronounced
        );
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

        for (int i = 0; i <= n; i++) dp[i][0] = i;
        for (int j = 0; j <= m; j++) dp[0][j] = j;

        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                int cost = a.get(i - 1).equals(b.get(j - 1)) ? 0 : 1;
                dp[i][j] = Math.min(
                        Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                        dp[i - 1][j - 1] + cost
                );
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
     * Generate AI response for conversation (mock)
     */
    public String generateAIResponse(String userMessage, String context) {
        String lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.contains("hello") || lowerMessage.contains("hi")) {
            return "Hello! How can I help you practice English today?";
        } else if (lowerMessage.contains("how are you")) {
            return "I'm doing well, thank you for asking! How are you doing?";
        } else if (lowerMessage.contains("goodbye") || lowerMessage.contains("bye")) {
            return "Goodbye! It was nice talking with you. Keep practicing!";
        } else {
            return "That's interesting! Can you tell me more about that?";
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
     * Kết quả phân tích phát âm chi tiết.
     */
    public static class PronunciationAnalysis {
        private final BigDecimal score;
        private final String expectedText;
        private final String recognizedText;
        private final List<String> mispronouncedWords;

        public PronunciationAnalysis(BigDecimal score, String expectedText, String recognizedText, List<String> mispronouncedWords) {
            this.score = score;
            this.expectedText = expectedText;
            this.recognizedText = recognizedText;
            this.mispronouncedWords = mispronouncedWords;
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

        public List<String> getMispronouncedWords() {
            return mispronouncedWords;
        }
    }
}

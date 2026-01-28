import java.sql.*;

public class DbDiagnostic {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/english_db";
        String user = "root";
        String password = "";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            System.out.println("Connection successful!");
            DatabaseMetaData metaData = conn.getMetaData();

            System.out.println("--- Table List ---");
            try (ResultSet rs = metaData.getTables("english_db", null, "%", new String[] { "TABLE" })) {
                while (rs.next()) {
                    String tableName = rs.getString("TABLE_NAME");
                    System.out.print("Table: " + tableName);
                    try (Statement stmt = conn.createStatement()) {
                        stmt.executeQuery("SELECT 1 FROM " + tableName + " LIMIT 1");
                        System.out.println(" - OK");
                    } catch (SQLException e) {
                        System.out.println(" - FAILED: " + e.getMessage());
                    }
                }
            }
        } catch (SQLException e) {
            System.err.println("Database connection failed: " + e.getMessage());
        }
    }
}

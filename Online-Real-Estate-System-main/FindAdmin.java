import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class FindAdmin {
    public static void main(String[] args) {
        try {
            Connection conn = DriverManager.getConnection("jdbc:postgresql://localhost:5432/real_estate", "postgres", "Mahipatel2206");
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT email, role FROM users WHERE role = 'ADMIN' OR email LIKE '%omp%'");
            while (rs.next()) {
                System.out.println("Email: " + rs.getString("email") + " | Role: " + rs.getString("role"));
            }
            conn.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

package uoa.web.storage;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;


import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.core.io.ResourceLoader;

import uoa.init.graphdb.Constants;

public class AuthorisationCacheStorage {

	
	
	/**
     * Create new database
     *
     * @param fileName the database file name
     */
    public static void createNewDatabase() {
        
        String url = "jdbc:sqlite:"+Constants.AUTHORISATION_CACHE_DATABASE_PATH;
        Connection conn =null;
        try  {
        	 conn = DriverManager.getConnection(url);
            if (conn != null) {
                DatabaseMetaData meta = conn.getMetaData();
                System.out.println("The driver name is " + meta.getDriverName());
                System.out.println("A new database has been created.");
               //conn.close();
               
               createHumanProvenaceGenerationTaskTable();
            }
         
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
        finally {
       	 try {
				conn.close();
			} catch (SQLException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
       }
       
        
    }
    
    
    /**
     * Create a table for logging authorisation tokens for provenance tasks executed by human agents
     *
     */
    public static void createHumanProvenaceGenerationTaskTable() {
        // SQLite connection string
    	 String url = "jdbc:sqlite:"+Constants.AUTHORISATION_CACHE_DATABASE_PATH;
        
        // SQL statement for creating a new table
        String sql = "CREATE TABLE IF NOT EXISTS HumanProvenaceGenerationTask (\n"
                + "	id integer PRIMARY KEY,\n"
                + "	agentIRI text NOT NULL,\n"
                + "	taskIRI text NOT NULL,\n"
                + "	token text NOT NULL,\n"
                + "	active text\n"
                + ");";
     
        Connection conn =null;
     
        try { conn = DriverManager.getConnection(url);
                Statement stmt = conn.createStatement();
            // create a new table
            stmt.execute(sql);
         //   conn.close();
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
        finally {
        	 try {
				conn.close();
			} catch (SQLException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
        }
    }
	
	
}

package uoa.web.storage;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.UUID;

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
                + "	executiontraceBundleIRI text NOT NULL,\n"
                + "	planIRI text NOT NULL,\n"
                + "	token text NOT NULL,\n"
                + "	status text\n"
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
    
    /**
     * Create  human agent task
     *
     */
    public static void createHumanProvenaceGenerationTask(String planIRI, String agentIRI) {
    	 // SQLite connection string
   	 String url = "jdbc:sqlite:"+Constants.AUTHORISATION_CACHE_DATABASE_PATH;
       
   	 String sql = "INSERT INTO HumanProvenaceGenerationTask(executiontraceBundleIRI,planIRI,token,status) VALUES(?,?,?,?)";
   	 Connection conn =null;
     try {
    	 conn = DriverManager.getConnection(url);
         PreparedStatement pstmt = conn.prepareStatement(sql);
         pstmt.setString(1, agentIRI);
         pstmt.setString(2, planIRI);
         pstmt.setString(3, UUID.randomUUID().toString());
         pstmt.setString(4, "Active");
         pstmt.executeUpdate();
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


	public static ArrayList  <HashMap <String,String>> getHumanProvenaceGenerationTasksForPlan(String planIRI) {
		 // SQLite connection string
	   	 String url = "jdbc:sqlite:"+Constants.AUTHORISATION_CACHE_DATABASE_PATH;
	    
	   	 String sql = "SELECT executiontraceBundleIRI,planIRI,token,status FROM HumanProvenaceGenerationTask WHERE planIRI= ? " ;
	     ArrayList  <HashMap <String,String>> list = new ArrayList <HashMap <String,String>> ();
	   	 Connection conn =null;
	     try {
	    	 conn = DriverManager.getConnection(url);
	    	 PreparedStatement pstmt  = conn.prepareStatement(sql);
	    	 pstmt.setString(1,planIRI);
	    	
	    	 
             ResultSet rs    = pstmt.executeQuery();
           
            // loop through the result set
            while (rs.next()) {
            	
            	HashMap  <String,String> map = new HashMap  <String,String> ();
            	map.put("executiontraceBundleIRI",  rs.getString("executiontraceBundleIRI") );
            	map.put("planIRI",  rs.getString("planIRI") );
            	map.put("token",  rs.getString("token") );
            	map.put("status",  rs.getString("status") );
            	list.add(map);
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
	return list;
	}
	
	public static HashMap <String,String> getDetailsForHumanGenrationTaskToken(String token) {
		 // SQLite connection string
	   	 String url = "jdbc:sqlite:"+Constants.AUTHORISATION_CACHE_DATABASE_PATH;
	    
	   	 String sql = "SELECT executiontraceBundleIRI,planIRI,status FROM HumanProvenaceGenerationTask WHERE token= ? LIMIT 1" ;
	 	HashMap  <String,String> map = new HashMap  <String,String> ();
	   	 Connection conn =null;
	     try {
	    	 conn = DriverManager.getConnection(url);
	    	 PreparedStatement pstmt  = conn.prepareStatement(sql);
	    	 pstmt.setString(1,token);
	    	
	    	 
            ResultSet rs    = pstmt.executeQuery();
          
           // there should be only one result
           while (rs.next()) {
           	
           
           	map.put("executiontraceBundleIRI",  rs.getString("executiontraceBundleIRI") );
           	map.put("planIRI",  rs.getString("planIRI") );
           	map.put("status",  rs.getString("status") );
           
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
	return map;
	}
	
}

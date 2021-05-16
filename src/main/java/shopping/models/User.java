/**
 * 
 */
package shopping.models;

import org.springframework.data.annotation.Id;

/**
 * @author Raslan
 *
 */
public class User {
	
//	@Id
//	private Long id;
	
	private String username;
	
	/**
	 * @return the username
	 */
	public String getUsername() {
		return username;
	}
	/**
	 * @param username the username to set
	 */
	public void setUsername(String username) {
		this.username = username;
	}
	public User () {
	}
	public User (String username) {
		this.username = username;
	}
	
	
}

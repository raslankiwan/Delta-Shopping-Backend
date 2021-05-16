/**
 * 
 */
package shopping.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import shopping.models.User;
import shopping.repositories.UserRepository;

/**
 * @author Raslan
 *
 */
@RestController
public class UserController {
	
	@Autowired
	private UserRepository repository;
	
	@GetMapping(path = "test")
	public ResponseEntity<User> getUser() {

		// save a couple of customers
		User x = repository.save(new User("Raslan"));
		return ResponseEntity.ok(x);
		
	}
}

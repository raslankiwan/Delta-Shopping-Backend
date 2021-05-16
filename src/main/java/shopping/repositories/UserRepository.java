/**
 * 
 */
package shopping.repositories;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import shopping.models.User;

/**
 * @author Raslan
 *
 */
@Repository
public interface UserRepository extends MongoRepository<User, Long> {

}

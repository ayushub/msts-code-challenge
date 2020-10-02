# Dispute Center Code Challenge

The application you will be working on is for handling disputes financial transactions.  
Users should be able to log in and see their recent transactions and choose to submit a dispute for example a fraudulent purchase.  
Disputes will then be either accepted or rejected by a Admin users.

The application is just one "micro service" among several constituting the hypothetical product. 
It will integrate with two other services, `Authentication` and `Transactions`, for handling user login and retrieving information regarding transactions. For the purpose of this exercise you will have access to mocked versions of these services and you will find the contracts defined in the last section of this file.


## Getting started 

```sh
# Clone repository
git clone git@gitlab.com:msts-code-challenges/dispute-center.git

# Standup containers
cd dispute-center
docker-compose up
```

Wait for the output:

```
Dispute center UI host and proxy listening on port 8080 ...
```

Before navigating to http://localhost:8080/ and logging in with any of the following
credentials:

| username     | password | role      |
| ------------ | -------- | --------- |
| khatrick6    | pwd05!   | Admin     |
| dbradick2    | pwd13!   | Purchaser |
| rstephenson5 | pwd26!   | Purchaser |


The database is setup by the `docker-compose.yml` confiugration and is seeded with two dispute records for the `dbradick2` user (see `postgres-seed-data.sql`.) Database schema is defined in `postgres-schema.sql` and the container is configured with `tmpfs` for the data directory so that the database is recreated between each restart. This was done to make sure we have an up to date schema running in the database. If you don't like this behaviour just remove the `tmpfs` configuration.

## Submission

Fork this repository on gitlab and spend up 2-3 hours implementing the feature requests in the challenge section. 
If you have time left to spend after implementing the features you can try to fix the reported bugs and / or address the developer / technical concerns. 

Once you are finished with your work commit and push it to your forked repository. Invite the following gitlab users with at least the `Reporter` permission level (you invite users to your repository from the `Members` section. 
  
- @mikwal-msts
- @kkhan.msts
- @asdan.msts

## Challenge

The challenge consist of you finishing the feature requests listed below that has not already been implemented.
You can also optionally address any of the reported bugs or the developer / technical concerns.  
  
Feel free to replace or add whatever library / framework  you see fit or introduce a new language (`TypeScript`, `SCSS`, `Less` etc). You are also allowed to change the database model, or even database server as long as there is a docker image for it, if you feel that would help.  

The only files that should remain exactly "as is" is `mocked-service.json` and `mocked-data.json` as they represent other micro services which your application integrating with and over which you don't have any control.  

Just make sure that the solution is still runnable by running `docker-compose up` and navigating to http://localhost:8080. As long as the `backend` and `frontend` may be started by the `yarn start` command in the respective folder this should work.  

### Feature requests 

The following features have been scoped for the Dispute Center web application:

_A tick in the checkbox next to the feature means it has already been implemented._

- [x] **Login**  
    http://localhost:8080/login  
    A a user I should be able to log in to the system with my username / password credentials.
    If I'm idle for a certain time I should be logged out of the system automatically and redirected back
    to the login screen.

- [x] **Transactions overview**  
    http://localhost:8080/  
    As a Purchaser I would like to see a list of my recent most recent transactions and their current dispute status.
    As a Admin I would like see a list of all purchasers most recent transactions and their current dispute status.
    I should be able to click on a link that takes me to the transaction dispute details.
      
- [x] **Transaction dispute details**  
    http://localhost:8080/dispute/?transaction_id=T8920719059    
    As a user I should be able to view details for a specific transaction along with its current dispute status and
    a log of historical dispute actions.
      
- [ ] **Submit a dispute for a transaction**  
    As a Purchaser I should be able to submit a dispute for one of my transactions (from the details view.)   
      
    _AC1:_ Only negative transactions should be able to be disputed  
    _AC2:_ Only transactions that have fulfill either of the following criterias should be able to be disputed:  
    _-_ Has not previously been disputed.  
    _-_ Has the dispute status 'Rejected'.  
    _AC3:_ A reason for the dispute must be provided when submitted, minimum 20 characters.

- [ ] **Accept / Reject a transaction dispute**  
    As a Admin I should be able to accept or reject a transaction dispute (from the details view.)   
      
    _AC1:_ Only transactions with the dispute status 'Submitted' should be able to be accepted or rejected.
      

### Reported bugs

The following bugs have been reported by users for the features already implemented:

- [ ] A user have reported that she keeps getting logged out of the system every ~15-20 minutes or so even if she is active in the application.  
- [ ] Several users has reported that the transaction dates shown in the overview and detail view doesn't always match when they did the purchase.

### Developer / technical concerns

The following items have been raised by developers

- [ ] There are no automated test suite for any of the features implemented.

## Mocked services

*Authentication service:*

```yaml
# Request an authentication 
'POST /api/authentication':  
    request: 
        {
            "username": string,
            "password": string
        }
    # For valid credentials: (user info and authentication token)
    response: 
        {
            "user": {
                "id": string,
                "username": string,
                "role": string, # "Purchaser" or "Admin",
                "account_ids": [string, ...]
            },
            "token": string,
            "token_issued": number,
            "token_expires": number
        }
    # For invalid credentials: (empty object response, still status code 200)
    response: 
        { }

# Retreive user info and re-issued authentication token.
# Responds with 401 for an invalid or expired authentication token.
'GET /api/authentication':
    headers: 
        # Responds with 401 for an invalid or expired authentication token.
        Authorization: Bearer {token}  
    response: 
        {
            # Same as the content for a successful POST /api/authentication
            ...
        }
```

*Transactions service:*

```yaml
# Retrieves a list of recent transactions which the user has access to view (depends on role.)
# Ordered by transaction time in descending order.
# - Admin role users can view all transactions
# - Purchaser role users can view transactions for their accounts
'GET /api/transactions':
    headers: 
        # Responds with 401 for an invalid or expired authentication token.
        Authorization: Bearer {token}  
    response: 
        [
            {
                "id": string,
                "account_id": string,
                "time": string, # ISO 8601 timestamp "YYYY-MM-DDTHH:mm:ssZ",
                "amount": number, # In cents, negative for purchases and positve for credits / payments.
                "description": string
            },
            ...
        ]

# Retrieves a specific transaction, same view access logic as the list endpoint.
'GET /api/transactions/{id}':
    headers: 
        # Responds with 401 for an invalid or expired authentication token.
        Authorization: Bearer {token}  
    response: 
        {
            # Same as the content for one element in the array returned by the list endpoint.
            # Responds with 404 if the transaction does not exist or the user don't have 
            # view access for the transaction.
            ...
        }
```


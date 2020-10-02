# Tips

Just some additional information that might be of help whilst implementing the new features.

## Debugging in VSCode

The backend container is configured to run node with `--inspect` listening on port `9229` so if you are using VSCode you can enable debugging by putting the configuration below into your `.vscode/launch.json` file and run `Debug: Start Debugging` to attach to the backend container.

```js
{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Debug backend",
            "type": "pwa-node",
            "request": "attach",
            "address": "localhost",
            "port": 9229,
            "localRoot": "${workspaceFolder}/backend",
            "remoteRoot": "/app",
            "restart": true
        }
    ]
}
```

## Connect to the database (for adhoc queries)

The `database` container is configured to expose the standard `postgres` port `5432` and you can connect to it with the following parameters:

```yaml
PGHOST: localhost
PGUSER: dispute-center
PGPASSWORD: pwd01!
PGDATABASE: dispute_center
```

## Run local environment without docker

If you choose to run the solution without `docker` you will need to install a `posgres` server on your machine or have access to an existing one.

You will need to create new database on the server and execute the scripts below on it.
* `postgres-schema.sql`
* `postgres-seed-data.sql`

After that run the following in three different terminals:

```sh
# Start the mocked services, will default run on port 2000
node mocked-services.js
```

```sh
# Start the backend, will default run on port 3000
export PGHOST="<localhost or your remote pg server>"
export PGDATABASE="<your database name>"
export PGUSER="<your postgres user account>" 
export PGPASSWORD="<the password>"
cd backend
yarn start
```

```sh
# Start the frontend host, will default run on port 8080
cd frontend
yarn start
```
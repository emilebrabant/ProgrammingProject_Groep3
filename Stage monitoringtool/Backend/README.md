# Stage Monitoringtool - Backend

Backend van de stage monitoringtool. Deze API verzorgt authenticatie, sessiebeheer, gebruikersbeheer en de data voor stages, competenties en evaluaties.

## Functionaliteiten

- inloggen en uitloggen met sessies
- opvragen van de ingelogde gebruiker
- verplicht wachtwoord wijzigen bij eerste login
- gebruikersbeheer voor admins
- beheer van stagevoorstellen, logboeken en overeenkomsten
- beheer van competenties
- evaluaties voor student en mentor
- rolgebaseerde toegang tot endpoints

## Gebruikte technologieën

- Node.js
- Express 5
- MySQL
- express-session
- bcrypt
- multer
- dotenv
- cors

## Vereisten

- Node.js 20 of nieuwer
- npm
- MySQL-database

## Installatie

Installeer de dependencies in de backend-map:

```bash
npm install
```

Maak daarna een .env-bestand aan met minstens deze variabelen:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=jouw_wachtwoord
DB_NAME=jouw_database
SESSION_SECRET=jouw_geheime_sleutel
```

Start vervolgens de backend:

```bash
npm run dev
```

Of in productie-modus:

```bash
npm start
```

## Scripts

- `npm run dev` - start de server met auto-reload via Node watch
- `npm start` - start de server normaal

## API-basis

De server draait standaard op:

http://localhost:3000

De frontend gebruikt deze API via:

http://localhost:3000/api

## Belangrijkste endpoints

### Authenticatie
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
- POST /api/auth/change-password-first-login

### Gebruikersbeheer
- GET /api/users
- POST /api/users
- PATCH /api/users/:id
- PATCH /api/users/:id/role
- DELETE /api/users/:id

### Stages
- GET /api/stages
- POST /api/stages
- GET /api/stages/mijn
- GET /api/stages/docenten
- PATCH /api/stages/:id
- GET /api/stages/:id
- GET /api/stages/:id/historiek
- POST /api/stages/:id/overeenkomst
- GET /api/stages/:id/overeenkomst
- PATCH /api/stages/:id/overeenkomst/validatie

### Logboeken
- GET /api/stages/logboeken/mijn
- POST /api/stages/logboeken
- GET /api/stages/logboeken/mentor
- GET /api/stages/logboeken/docent
- POST /api/stages/logboeken/:id/feedback
- PATCH /api/stages/logboeken/:id/aftekenen
- GET /api/stages/logboeken/:id/feedback

### Competenties
- GET /api/competenties
- POST /api/competenties
- PATCH /api/competenties/:id
- DELETE /api/competenties/:id

### Evaluaties
- GET /api/evaluaties/student
- POST /api/evaluaties/student/zelfevaluatie
- GET /api/evaluaties/mentor
- POST /api/evaluaties/mentor/score
- PATCH /api/evaluaties/mentor/indienen

### Dashboard
- GET /dashboard/student
- GET /dashboard/commissie
- GET /dashboard/docent
- GET /dashboard/mentor
- GET /dashboard/admin

## Rollen

De backend gebruikt sessiegebaseerde authenticatie en rolcontrole voor:

- admin
- commissie
- docent
- mentor
- student

Gebruikers zonder geldige sessie krijgen een 401-respons. Gebruikers zonder juiste rol krijgen een 403-respons.

## Database

De verbinding met MySQL wordt opgezet via de waarden uit het .env-bestand. De API verwacht tabellen voor onder meer:

- users
- stages
- logboeken
- evaluaties
- competenties

## Bestanden en uploads

Geüploade bestanden, zoals stageovereenkomsten, worden opgeslagen in de map uploads.

## Testen

De server bevat enkele eenvoudige testroutes:

- GET / geeft een algemene statusmelding
- GET /db-test controleert de databaseverbinding

## Opmerking

Deze backend werkt samen met de frontend in dezelfde Stage monitoringtool en moet actief zijn voordat de frontend volledig functioneert.

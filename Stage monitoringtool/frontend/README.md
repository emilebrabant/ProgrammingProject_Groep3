# Stage Monitoringtool - Frontend

Frontend van de stage monitoringtool voor het opvolgen van stageplaatsen, logboeken en evaluaties.

De applicatie is gebouwd met React en Vite en gebruikt rolgebaseerde webpagina's voor:

- admin
- commissie
- docent
- mentor
- student

## Functionaliteiten

- inloggen met sessie-gebaseerde authenticatie
- automatische doorverwijzing op basis van rol
- verplichte wachtwoordwijziging bij eerste login
- afgeschermde routes per gebruikersrol
- beheer van gebruikers, stages en competenties voor admins
- stageoverzicht, logboeken en evaluaties per rol
- aanmaken en aanpassen van stagevoorstellen voor studenten

## Gebruikte technologieën

- React 19
- React Router
- Axios
- Bootstrap 5
- Vite

## Vereisten

- Node.js 20 of nieuwer
- npm
- de backend van het project op http://localhost:3000

## Installatie

Installeer de dependencies in de frontend-map:

```bash
npm install
```

Start daarna de frontend:

```bash
npm run dev
```

De applicatie draait dan standaard op http://localhost:5173.

## Scripts

- `npm run dev` - start de ontwikkelserver
- `npm run build` - maakt een productiebuild
- `npm run preview` - bekijkt de productiebuild lokaal

## Koppeling met de backend

De frontend communiceert met de backend via Axios en gebruikt als basis-URL:

http://localhost:3000/api

Daarom moet de backend eerst of parallel gestart worden. Sessies worden meegestuurd via cookies.

## Rollen en navigatie

Na het inloggen wordt de gebruiker automatisch doorgestuurd naar het juiste overzicht:

- admin → /admin/users
- commissie → /commissie/stages
- student → /student/stagevoorstellen
- mentor → /mentor/koppeling-studenten
- docent → /docent/studenten

Gebruikers met `eerste_login = true` worden eerst naar de wachtwoordwijziging gestuurd.

## Projectstructuur

- src/api - API-configuratie
- src/components - herbruikbare componenten zoals beveiligde routes
- src/context - authenticatiecontext
- src/pages - pagina's per rol en functionaliteit

## Opmerking

Dit is de frontend van het project. De backend staat in de map Backend en levert de API waarop deze applicatie draait.

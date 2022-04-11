# Projekt: Crity

Die aktuelle _Release_-Version dieses Projekts kann unter: https://crity.software-engineering.education aufgerufen werden.

```
Diese Anwendung erlaubt es, PDF-Präsentationen zu versionieren, und diese Versionen zu bewerten.
```

## Nutzeranleitung

### Erstellen eines Accounts

Durch Klick auf "Create an Account" auf der Login-Seite oder direkt [hier](https://crity.software-engineering.education/#create-account) kann man einen neuen Account anlegen. Es kann pro E-Mail nur ein Account angelegt werden.

![Erstellen eines Accounts](/screenshots/create-account.png)

### Anmelden
Mit der E-Mail-Adresse und dem Passwort kann man sich auf [der Login-Seite](https://crity.software-engineering.education/#login) anmelden.
![Login](/screenshots/login.png)

Danach bleibt man angemeldet, bis man sich oben in der Navigationsleiste abmeldet.

### Dashboard
Nach der Anmeldung oder durch Klick auf das Logo gelangen angemeldete Nutzer auf das Dashboard. Dort können durch Klick auf den (+) Button neue Präsentationen erstellt werden. 

![Erstellen einer Präsentation](/screenshots/präsentationsErstellung.png)

Jede Präsentation hat einen Titel und eine Beschreibung. Alle Präsentationen eines Nutzers werden im Dashboard angezeigt. Durch Klick auf den (...) Knopf der Präsentationen können
- Titel/Beschreibung bearbeitet werden
- Präsentationen gelöscht werden.

![Bearbeiten einer Präsentation: Schritt 1](/screenshots/edit-presentation-1.png)
![Bearbeiten einer Präsentation: Schritt 2](/screenshots/edit-presentation-2.png)

Durch Klick auf die Präsentation selbst gelangt man zum...

### Editor

Im Editor wird eine Präsentation angezeigt. Durch Kopieren der URL (z. B. über den Copy-Link Button in der Navigationsleiste) kann man diese mit Bewertern teilen.

Um den Editor einer Präsentation zu öffnen, braucht man nicht angemeldet zu sein.

Jede Präsentation besteht aus mehren Versionen. Jede Version ist geknüpft an eine PDF. Die Versionen werden in der Timeline angezeigt, die ein- und ausgeklappt werden kann.

![Zeitleiste](/screenshots/timeline.png)

Um eine Version (und somit eine PDF) hochzuladen, kann man auf den (Add Version)-Button klicken. Versionen werden als Knoten in einer Baumstruktur angezeigt. Diese Knoten werden selektiert werden. Der selektierte Knoten erhält die neue Präsentation als Kind. Ist kein Knoten selektiert, so wird die Präsentation als Wurzelknoten erstellt. Durch **Doppelklick** wird eine Version ausgewählt, und man kann sich durch Einklappen der Timeline betrachten. Derzeit kann jeder eine neue Version erstellen. Mit der linken Maustaste kann man die Ansicht verschieben, durch Drehen des Mausrads kann man scrollen.

![Zeitleistevideo](/screenshots/timeline.gif)

Jede PDF besteht bekanntlich aus mehreren Seiten. Diese Seiten werden links in Form von Thumbnails angezeigt. Durch Klick auf ein Thumbnail wird die entsprechende Seite ausgewählt.

Die ausgewählte Seite wird in der Mitte angezeigt. Der Viewer erlaubt es, durch Drehen des Mausrads zu zoomen, und durch Drücken des Mausrads die Ansicht zu verschieben. Außerdem kann, falls die Schriften nicht gebakt wurden, Text selektiert werden (Dabei erscheint auch ein gelber Punkt, siehe unten).

![EditorMovement](/screenshots/moveEditors.gif)

Jede Seite besitzt eine Liste von Threads. Diese bestehen aus einer Position auf der Folie, einem Verfasser und einem Titel (Text). Einen Thread erstellt man indem man:
- Im Hauptbereich an der gewünschten Stelle auf der Seite mit der linken Maustaste klickt.

![EditorMakeThread](/screenshots/makePoint.gif)

- Rechts erscheint ein Kommentar-Editor. Dort kann man ein beliebiges Pseudonym für den Verfasser und den Titel des Threads eingeben.
![Editor für neue Threads](/screenshots/thread-editor.png)

Threads werden nach der Anzahl an Votes sortiert. Dies geschieht nach einem Page-Refresh.

Threads lassen sich ausklappen. Sobald man tut das tut:
- wird der Punkt, zu dem der Thread gehört, durch Änderung der Größe hervorgehoben,
- kann man im Kommentar-Editor, der auftaucht, neue Unterkommentare hinzufügen,
![Editor für neue Threads](/screenshots/subcomment-editor.png)
- sieht man die Unterkommentare.
![Editor für neue Threads](/screenshots/answers.png)


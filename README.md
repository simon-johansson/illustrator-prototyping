#Illustrator prototyper
A tool for making interactive prototypes out of SVG:s created in Adobe Illustrator.   

##How does it work?
...

##Who is this for?
...

##Layer naming and available interactions
...

##För att kunna köra lokalt

Front-end libs och Node mooduler är inte en del av repot, för att installera dessa kör:

	 $ npm install
	 $ bower install
	 
Detta kräver att du har Node-modulen Bower installerat globalt, läs mer [här](http://bower.io/). Vilka libs/moduler som är en del av projektet står angivet i package.json respektive bower.json

Grunt använder sig av [compass](http://compass-style.org/) för att kompilera SCSS-filerna. Compass är en Ruby Gem som lättast installeras genom att skriva in följande i terminalen (sudo kan krävas):

	$ gem update --system
	$ gem install compass

För att starta utvecklingsservern med live reload, SCSS-kompilering mm. (förutsätter att du står i mappen som innehåller Gruntfile.js):

	$ grunt serve

för att bygga projektet, dvs. komprimerar och konkatenerar JS-filer mm. (Görs först när det är dags att lägga upp allt på en riktig server):
	
	$ grunt build

##TODO
* Koppla till Dopbox så att man kan ha filerna liggandes lokalt men att JavaScripten och all magi ligger någon annanstans. 
    * Genom att ta en länk till en svg-fil som ligger i Public-mappen, tex. [https://dl.dropboxusercontent.com/u/48054994/svg-prototoype/example-1.svg](https://dl.dropboxusercontent.com/u/48054994/svg-prototoype/example-1.svg), och byta ut domännamnet till ett som leder till appen, tex. **http://svg-prototyper.com**/u/48054994/svg-prototoype/example-1.svg, borde appen starta och automatiskt läsa in filen.
* Drag-n-drop:a in svg-filerna
* Generera en QR-kod när man har laddat upp en SCG-fil, alternativt angett en Dropbox-länk, så att man enkelt kan gå in på prototypen med mobilen.
* Slide-in/slide-out events borde finnas med
* Göra det möjligt att namnge lagren och ev. göra andra inställningar direkt gränssnittet, inte vara låst till att göra det genom speciell namngivning i Illustrator.
* Ska inte behöva köra en server lokalt, hur löser man det bäst?
* ~~Lyft ut CSS:n och lägg det i en extern SASS-fil~~
* ~~Skapa ett bygg-skript med Grunt (livereload och andra fina grejer)~~
* ~~Använd Require.js för att dela upp koden i moduler och splitta koden till olika filer~~
* ~~Fixa så att det fungerar i Chrome~~

 

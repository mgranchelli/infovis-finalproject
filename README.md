# InfoVis - Final Project

## Autori
* [Daria Occhioni](https://github.com/dariucc)
* [Manuel Granchelli](https://github.com/mgranchelli)

--------------------------------------------------------------------------------
## Goal
Il seguente progetto consiste nel visualizzare i personaggi presenti all'interno dei libri della saga **[The Witcher](https://en.wikipedia.org/wiki/The_Witcher)**.
Si possono osservare due diverse visualizzazioni, una che visualizza tutti i personaggi presenti all'interno di tutta la saga e un'altra che permette di visualizzare i personaggi presenti all'interno di ciascun libro.
I personaggi sono stati estratti dai libri in formato testuale attraverso il notebook `split_chapter.ipynb`.
Successivamente attraverso il notebook `create_csv_json.ipynb` sono stati creati i file `json` per ogni libro utilizzati nella visualizzazione. Per la creazione dei seguenti file sono stati considerati solo i personaggi presenti per più della metà dei capitoli. I file contengono per ogni capitolo, una riga contenente il numero del capitolo e le successive righe contengono i personaggi che sono rappresentati da uno 0 oppure 1 a seconda della non presenza o presenza nel capitolo. 

Esempio **Libro 1 - Capitolo 1**:
```json
{
    "chapter": 1,
    "Lambert": 1,
    "Eskel": 1,
    "Vesemir": 1,
    "Calanthe": 1,
    "Yennefer": 1,
    "Ciri": 1,
    "Geralt": 1,
    "Foltest": 1,
    "Pavetta": 1,
    "Dandelion": 1,
    "Triss": 0,
    "Nenneke": 0
}
```

La visualizzazione inizia con l'overview di tutti i libri con tutti i personaggi presenti ed è possibile cambiare visualizzazione selezionando il libro dal menù in alto, contenente i pulsanti per selezionare i libri, oppure selezionando il rettangolo del libro corrispondente. Passando alla visualizzazione del libro i rettangoli rappresentano i capitoli e non sono più selezionabili.
In entrambe le visualizzazioni i rettangoli sono proporzionali al numero di personaggi presenti nel determinato libro o capitolo.
I personaggi sono rappresentati dalle linee che passano attraverso i rettangoli solamente se presenti all'interno del libro o capitolo.
In entrambe le visualizzazioni si può evidenziare una linea per volta, attraverso il click sinistro del mouse, per poter visualizzare il nome del personaggio.

--------------------------------------------------------------------------------

## Run
Il progetto è possibile testarlo in locale o attraverso la demo seguente.
### Test in locale:
```bash
$ git clone https://github.com/mgranchelli/infovis-finalproject.git
$ cd ./infovis-finalproject
$ python3 -m http.server 8888
```
Aprire un browser al seguente link: [http://localhost:8888/](http://localhost:8888/)

### Demo

Link: https://mgranchelli.github.io/infovis-finalproject/
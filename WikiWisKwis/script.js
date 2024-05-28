document.addEventListener('DOMContentLoaded', () => {
    const title = 'Doornroosje';  // Pas hier de titel van het artikel aan
    fetchWikipediaArticle(title)
        .then(html => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const text = tempDiv.innerText;
            window.articleTitle = title.toLowerCase();
            window.originalHtml = html;
            window.originalText = text;
            window.blurredText = blurText(text);
            displayText(window.blurredText);
        });
});

const fetchWikipediaArticle = async (title) => {
    const response = await fetch(`https://nl.wikipedia.org/w/api.php?action=parse&page=${title}&format=json&origin=*`);
    const data = await response.json();
    return data.parse.text['*'];
};

const blurText = (text) => {
    const allowedWords = ['de', 'het', 'een', 'en', 'van', 'in', 'op', 'te', 'die', 'zijn', 'deze', 'dat', 'door', 'was'];
    return text.split(' ').map(word => {
        return allowedWords.includes(word.toLowerCase()) || !isNaN(word) ? word : '______';
    }).join(' ');
};

const displayText = (text) => {
    document.getElementById('article').innerHTML = text.split(' ').map(word => {
        if (word === '______') {
            return `<span class="blurred">${word}</span>`;
        }
        return word;
    }).join(' ');
};

const updateGuessedWords = (word, count) => {
    const guessedWordsList = document.getElementById('guessed-words-list');
    const listItem = document.createElement('li');
    listItem.innerText = `${word}: ${count}`;
    guessedWordsList.appendChild(listItem);
};

const makeGuess = () => {
    const guess = document.getElementById('guess').value.trim().toLowerCase();
    if (!guess) return;

    if (guess === window.articleTitle) {
        // Toon volledige tekst en verberg input
        document.getElementById('article').innerHTML = window.originalHtml;
        document.getElementById('guess').classList.add('hidden');
        document.querySelector('button').classList.add('hidden');
        document.getElementById('guess-info').innerText = 'Gefeliciteerd! Je hebt het artikel geraden.';
        return;
    }

    const originalWords = window.originalText.split(' ');
    const blurredWords = window.blurredText.split(' ');

    let correctGuess = false;
    let wordCount = 0;
    for (let i = 0; i < originalWords.length; i++) {
        if (originalWords[i].toLowerCase() === guess && blurredWords[i] === '______') {
            blurredWords[i] = `<span class="highlight">${originalWords[i]}</span>`;
            correctGuess = true;
            wordCount++;
        }
    }

    window.blurredText = blurredWords.join(' ');
    displayText(window.blurredText);

    if (correctGuess) {
        document.getElementById('guess-info').innerText = `Het woord "${guess}" komt ${wordCount} keer voor.`;
        if (!window.blurredText.includes('______')) {
            document.getElementById('guess').classList.add('hidden');
            document.querySelector('button').classList.add('hidden');
            document.getElementById('guess-info').innerText = 'Gefeliciteerd! Je hebt het hele artikel geraden.';
            document.getElementById('article').innerHTML = window.originalHtml; // Toon volledige tekst
        }
    } else {
        document.getElementById('guess-info').innerText = `Het woord "${guess}" komt 0 keer voor.`;
    }

    updateGuessedWords(guess, wordCount);

    document.getElementById('guess').value = '';
};

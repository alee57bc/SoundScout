// Feature card click behavior: show the matching recommendation panel and hide the others
(function() {
    const cards = document.querySelectorAll('.feature-card');
    const recommendationSection = document.querySelector('.recommendation-section');
    // Map card id -> panel id
    const panelMap = {
        'personal-card': 'personal-recommendations',
        'vibe-card': 'vibe-recommendations',
        'genre-card': 'genre-recommendations',
        'similarity-card': 'similarity-recommendations',
        'random-card': 'random-recommendations'
    };

    function hideAllPanels() {
        document.querySelectorAll('.recommend-pannels').forEach(p => {
            p.style.display = 'none';
            p.classList.remove('is-active');
        });
    }

    function anyCardActive() {
        return Array.from(cards).some(c => c.classList.contains('is-active'));
    }

    const checkboxSpacer = document.getElementById('checkbox-spacer');
    // initialize: hide recommendation section if no card active
    if (recommendationSection && !anyCardActive()) {
        recommendationSection.style.display = 'none';
    }
    // initialize checkbox spacer visibility based on any active card
    const activeCard = document.querySelector('.feature-card.is-active');
    if (checkboxSpacer) {
        if (activeCard && activeCard.id === 'random-card') {
            checkboxSpacer.style.display = 'none';
        } else {
            checkboxSpacer.style.display = '';
        }
    }

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const wasActive = card.classList.contains('is-active');

            // clear current state
            cards.forEach(c => c.classList.remove('is-active'));
            hideAllPanels();

            //1 = clear value, 2 = clear display, 3 = item 1 and 2, 4 = uncheck checkbox
            const clearList = {'vibe-text': 1, 'genre-text': 3, 'bpm-input': 1, 'similar-song': 1, 'genre-dropdown': 1, 'input-number': 1,
                                'number-selection': 2, 'check': 4
                                }
            for (let key of Object.keys(clearList)){
                const currItem = document.getElementById(key)
                const currTitle = clearList[key]
                if (currTitle === 1 && currItem.value != ''){
                    currItem.value = '';
                } else if (currTitle === 2 && currItem.style.display != 'none'){
                    currItem.style.display = 'none';
                } else if (currTitle === 3 && (currItem.value != '' || currItem.style.display != 'none')){
                    currItem.value = '';
                    currItem.style.display = 'none'; 
                } else {
                    currItem.checked = false;
                }
            }
        
            if (!wasActive) {
                // activate clicked card and show its panel
                card.classList.add('is-active');
                const panelId = panelMap[card.id];
                if (panelId) {
                    const panel = document.getElementById(panelId);
                    if (panel) {
                        panel.style.display = 'flex';
                        panel.classList.add('is-active');
                    }
                }
                // show/hide the checkbox spacer depending on the selected card
                if (checkboxSpacer) {
                    if (card.id === 'random-card') {
                        checkboxSpacer.style.display = 'none';
                    } else {
                        checkboxSpacer.style.display = '';
                    }
                }
                if (recommendationSection) recommendationSection.style.display = 'grid';
            } else {
                // user clicked the active card -> hide the whole recommendation section
                if (recommendationSection) recommendationSection.style.display = 'none';
            } 
        });
    });
})();

//genre logic so that the textbox only shows when "i want to type it out" is selected
const genreDropdown = document.getElementById("genre-dropdown");
genreDropdown.addEventListener('change', () =>{
    const selectedValue = genreDropdown.value;

    if (selectedValue === "other") {
        document.getElementById("genre-text").value = '';
        document.getElementById("genre-text").style.display = "flex";
    } else { 
        document.getElementById("genre-text").style.display = "none";
    }   
});

//checkbox logic to show/hide number input
const checkbox = document.getElementById('check');
const numberSelection = document.getElementById('number-selection');
const numberInput = document.getElementById('input-number');

//make sure number input gets reset on load
if (numberInput) {
    numberInput.style.display = '';
}

if (checkbox) {
    checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
            if (numberSelection) numberSelection.style.display = 'flex';
            if (numberInput) {
                numberInput.style.display = '';
                numberInput.focus();
            }
        } else {
            if (numberSelection) numberSelection.style.display = 'none';
            if (numberInput) {
                numberInput.value = '';
                numberInput.style.display = '';
            }
        }
    });
} 


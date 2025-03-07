document.addEventListener("DOMContentLoaded", function() {
    const questionContainer = document.getElementById('question-container');
    const questionText = document.getElementById('question');
    const answersContainer = document.getElementById('answers');
    const uploadContainer = document.getElementById('upload-container');
    const pokemonBravo = document.getElementById('pokemon-bravo');

    const questions = [
        {
            text: "Você é a Bárbara?",
            answers: [
                { text: "Sim", next: 3 },
            ]
        },
        {
            text: "",
            answers: []
        },
        {
            text: "Ótimo! Vamos fazer o upscale da sua imagem!",
            answers: []
        },
        {
            text: "Você não é bem-vindo aqui!",
            answers: []
        }
    ];

    let currentQuestion = 0;

    function loadQuestion() {
        questionText.innerText = questions[currentQuestion].text;
        answersContainer.innerHTML = '';

        questions[currentQuestion].answers.forEach(answer => {
            const button = document.createElement('button');
            button.innerText = answer.text;
            button.onclick = () => {
                currentQuestion = answer.next;
                if (currentQuestion === 3) {
                    uploadContainer.style.display = 'block';
                    questionContainer.style.display = 'none';
                } else if (currentQuestion === 4) {
                    pokemonBravo.style.display = 'block';
                    questionContainer.style.display = 'none';
                } else {
                    loadQuestion();
                }
            };
            answersContainer.appendChild(button);
        });
    }

    loadQuestion();

    // Script for image upload and upscale
    document.getElementById('upload-form').addEventListener('submit', async function(event) {
        event.preventDefault();

        const imageInput = document.getElementById('image-input');
        if (imageInput.files.length === 0) {
            alert('Por favor, selecione uma imagem.');
            return;
        }

        const file = imageInput.files[0];
        const formData = new FormData();
        formData.append('image', file);

        document.getElementById('loading').style.display = 'block';

        try {
            const response = await fetch('/upscale', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const blob = await response.blob();
                const downloadUrl = URL.createObjectURL(blob);
                document.getElementById('download-url').href = downloadUrl;
                document.getElementById('download-link').style.display = 'block';
            } else {
                const errorResponse = await response.json();
                alert('Erro ao fazer o upscale: ' + errorResponse.error);
            }
        } catch (error) {
            alert('Erro ao enviar a imagem: ' + error.message);
        } finally {
            document.getElementById('loading').style.display = 'none';
        }
    });
});

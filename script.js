let dataArray = [];
let sortOrder = {};

// Определение правил для окрашивания строк
const colorRules = {
    '44.02.01 Дошкольное образование': {
        'Бюджет': {
            'Oчнo': 35,
            'Заочно': 20
        },
        'Коммерция': {
            'Oчнo': 15,
            'Заочно': 5
        }
    },
    '43.02.16 Туризм и гостеприимство': {
        'Бюджет': {
            'Oчнo': 25,
        }
    },
    '44.02.02 Преподавание в начальных классах':{
        'Бюджет': {
            'Oчнo': 25,
        },
        'Коммерция': {
            'Oчнo': 5,
        }
    },
    '44.02.04 Специальное дошкольное образования':{
        'Бюджет': {
            'Oчнo': 25,
        },
        'Коммерция': {
            'Oчнo': 5,
        }
    },
    '44.02.03 Педагогика дополнительного образования':{
        'Бюджет': {
            'Oчнo': 25,
        },
        'Коммерция': {
            'Oчнo': 5,
        }
    },
    '53.02.01 Музыкальное образование':{
        'Бюджет': {
            'Oчнo': 25,
        },
        'Коммерция': {
            'Oчнo': 5,
        }
    },
    '49.02.02 Адаптивная физическая культура':{
        'Бюджет': {
            'Oчнo': 25,
        },
        'Коммерция': {
            'Oчнo': 5,
        }
    },
    '39.02.01 Социальная работа':{
        'Бюджет': {
            'Oчнo': 25,
        }
    },
    '44.02.05 Коррекционная педагогика в начальном образовании':{
        'Бюджет': {
            'Oчнo': 25,
        },
        'Коммерция': {
            'Oчнo': 5,
        }
    },
    '54.02.06 Изобразительное искусство и черчение':{
        'Бюджет': {
            'Oчнo': 25,
        },
        'Коммерция': {
            'Oчнo': 5,
        }
    },
    '49.02.01 Физическая культура':{
        'Коммерция': {
            'Oчнo': 25,
        }
    },
    '54.01.20 Графический дизайнер':{
        'Коммерция': {
            'Oчнo': 25,
        }
    },
};

// Обработчик события для загрузки файла
document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            dataArray = csvToArray(text);
        };
        reader.readAsText(file);
    }
});

// Обработчик события для показа таблиц
document.getElementById('showTablesButton').addEventListener('click', function() {
    const showOriginalsOnly = document.getElementById('originalsOnlyCheckbox').checked;
    const sortedData = distributeStudentsByPriority(dataArray, showOriginalsOnly);
    displayTables(sortedData);
});

// Обработчик изменения состояния чекбокса
document.getElementById('originalsOnlyCheckbox').addEventListener('change', function() {
    const showOriginalsOnly = this.checked;
    const sortedData = distributeStudentsByPriority(dataArray, showOriginalsOnly);
    displayTables(sortedData);
});

// Обработчик события для скачивания PDF
document.getElementById('downloadPDFButton').addEventListener('click', downloadPDF);

// Функция для преобразования CSV в массив объектов
function csvToArray(csv) {
    const rows = csv.trim().split('\n');
    const headers = rows[0].split(';').map(header => header.replace(/"/g, '').trim());
    const data = rows.slice(1).map(row => {
        const values = row.split(';').map(value => value.replace(/"/g, '').trim());
        return {
            name: values[0],
            specialty: values[1],
            grade: parseFloat(values[2].replace(',', '.')),
            exam: values[3],
            priority: parseInt(values[4], 10),
            funding: values[5],
            form: values[6],
            provided: values[7],
            entranceExamResult: values[8]  // Добавляем поле для результатов вступительных испытаний
        };
    });
    return data;
}

// Функция для распределения студентов по приоритетам
function distributeStudentsByPriority(data, showOriginalsOnly) {
    const specialtyTables = {};
    const addedStudents = new Set();

    const validSpecialties = [
        '39.02.01 Социальная работа',
        '43.02.16 Туризм и гостеприимство',
        '44.02.01 Дошкольное образование',
        '44.02.02 Преподавание в начальных классах',
        '44.02.03 Педагогика дополнительного образования',
        '44.02.04 Специальное дошкольное образование',
        '44.02.05 Коррекционная педагогика в начальном образовании',
        '49.02.01 Физическая культура',
        '49.02.02 Адаптивная физическая культура',
        '53.02.01 Музыкальное образование',
        '54.01.20 Графический дизайнер',
        '54.02.06 Изобразительное искусство и черчение'
    ];

    const validForms = ['Oчнo', 'Заочно'];
    const validFundings = ['Бюджет', 'Коммерция'];
    
    const specialtiesAllowingNoExam = [
        '39.02.01 Социальная работа',
        '43.02.16 Туризм и гостеприимство',
        '44.02.03 Педагогика дополнительного образования',
        '54.01.20 Графический дизайнер'
    ];

    // Отфильтровать студентов по критериям, включая результаты вступительных испытаний
    const students = data.filter(student => 
        validSpecialties.includes(student.specialty) &&
        validForms.includes(student.form) &&
        validFundings.includes(student.funding) &&
        (student.entranceExamResult === 'Зачет' || student.entranceExamResult === 'Не предусмотрено') &&
        (student.exam === 'Да' || (specialtiesAllowingNoExam.includes(student.specialty) && student.exam === 'Нет'))
    ).sort((a, b) => b.grade - a.grade);

    // Создаем таблицы для каждого приоритета
    for (const student of students) {
        if (!showOriginalsOnly || student.provided === 'Оригинал') {
            const specialtyKey = `${student.specialty}-${student.funding}-${student.form}`;
            
            if (!specialtyTables[specialtyKey]) {
                specialtyTables[specialtyKey] = [];
            }

            student.priorityNumber = student.priority;
            specialtyTables[specialtyKey].push(student);
            addedStudents.add(student.name);
        }
    }

    return specialtyTables;
}

// Функция для отображения таблиц
function displayTables(data) {
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = '';

    for (const key in data) {
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');

        const headerRow = document.createElement('tr');
        ['№', 'Name', 'Specialty', 'Grade', 'Exam', 'Funding', 'Form', 'Provided', 'Entrance Exam Result', 'Priority Number', 'Action'].forEach((text, index) => {
            const th = document.createElement('th');
            th.textContent = text;
            if (text === 'Grade') {
                const arrowSpan = document.createElement('span');
                arrowSpan.classList.add('arrow');
                th.appendChild(arrowSpan);
                th.addEventListener('click', () => {
                    toggleSortOrder(data, key, index);
                });
            }
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        data[key].forEach((item, index) => {
            const row = document.createElement('tr');
            const numberCell = document.createElement('td');
            numberCell.textContent = index + 1;
            row.appendChild(numberCell);

            const nameCell = document.createElement('td');
            nameCell.textContent = item.name;
            row.appendChild(nameCell);

            const specialtyCell = document.createElement('td');
            specialtyCell.textContent = item.specialty;
            row.appendChild(specialtyCell);

            const gradeCell = document.createElement('td');
            gradeCell.textContent = item.grade.toFixed(2);
            row.appendChild(gradeCell);

            const examCell = document.createElement('td');
            examCell.textContent = item.exam;
            row.appendChild(examCell);
            
            const fundingCell = document.createElement('td');
            fundingCell.textContent = item.funding;
            row.appendChild(fundingCell);

            const formCell = document.createElement('td');
            formCell.textContent = item.form;
            row.appendChild(formCell);

            const providedCell = document.createElement('td');
            providedCell.textContent = item.provided;
            row.appendChild(providedCell);

            const entranceExamResultCell = document.createElement('td');
            entranceExamResultCell.textContent = item.entranceExamResult;  // Добавляем ячейку для результатов вступительных испытаний
            row.appendChild(entranceExamResultCell);

            const priorityNumberCell = document.createElement('td');
            priorityNumberCell.textContent = item.priorityNumber;
            row.appendChild(priorityNumberCell);

            // Добавляем кнопку удаления
            const actionCell = document.createElement('td');
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Удалить';
            deleteButton.addEventListener('click', () => {
                removeStudentFromTable(data, key, index);
            });
            actionCell.appendChild(deleteButton);
            row.appendChild(actionCell);

            let rowColor = '';
            const [specialty, funding, form] = key.split('-');
            const threshold = (colorRules[specialty] && colorRules[specialty][funding] && colorRules[specialty][funding][form]) || Infinity;
            
            if (index >= threshold) {
                rowColor = 'background-color: #ffcccc;';
            }

            row.style = rowColor;
            tbody.appendChild(row);
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        outputDiv.appendChild(table);

        const countDiv = document.createElement('div');
        countDiv.classList.add('student-count');
        countDiv.textContent = `Total students: ${data[key].length}`;
        outputDiv.appendChild(countDiv);

        const hr = document.createElement('hr');
        outputDiv.appendChild(hr);
    }
}

// Функция для удаления студента из определенной таблицы
function removeStudentFromTable(data, key, index) {
    data[key].splice(index, 1); // Удаляем студента из конкретной таблицы
    displayTables(data); // Перерисовываем таблицы
}

// Функция для сортировки таблиц
function toggleSortOrder(data, key, index) {
    let sortOrder = dataArray.sortOrder || {};
    let order = sortOrder[key] || 'desc';
    let newOrder = order === 'desc' ? 'asc' : 'desc';
    sortOrder[key] = newOrder;

    data[key].sort((a, b) => {
        if (index === 3) { // Столбец Grade
            return newOrder === 'asc' ? a.grade - b.grade : b.grade - a.grade;
        }
        return 0;
    });

    dataArray.sortOrder = sortOrder;
    displayTables(data);
}

// Функция для создания и скачивания PDF
async function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const tables = document.querySelectorAll('#output table');
    let yOffset = 10;

    for (const table of tables) {
        const headers = [];
        const rows = [];

        table.querySelectorAll('thead th').forEach(th => {
            headers.push(th.textContent);
        });

        table.querySelectorAll('tbody tr').forEach(tr => {
            const row = [];
            tr.querySelectorAll('td').forEach(td => {
                row.push(td.textContent);
            });
            rows.push(row);
        });

        doc.autoTable({
            head: [headers],
            body: rows,
            startY: yOffset,
            theme: 'striped',
            styles: {
                font: 'Roboto',
                cellPadding: 2,
                overflow: 'linebreak'
            }
        });

        yOffset = doc.autoTable.previous.finalY + 10;
    }

    doc.save('students.pdf');
}

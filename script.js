let dataArray = [];
let sortOrder = {};  // Для отслеживания порядка сортировки для каждой таблицы

// Приоритеты специальностей
const specialtyPriorities = {
    '39.02.01 Социальная работа': 1,
    '43.02.16 Туризм и гостеприимство': 2,
    '44.02.01 Дошкольное образование': 3,
    '44.02.02 Преподавание в начальных классах': 4,
    '44.02.03 Педагогика дополнительного образования': 5,
    '44.02.04 Специальное дошкольное образование': 6,
    '44.02.05 Коррекционная педагогика в начальном образовании': 7,
    '49.02.01 Физическая культура': 8,
    '49.02.02 Адаптивная физическая культура': 9,
    '53.02.01 Музыкальное образование': 10,
    '54.01.20 Графический дизайнер': 11,
    '54.02.06 Изобразительное искусство и черчение': 12
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
    const sortedData = distributeStudentsByAverageGrade(dataArray, showOriginalsOnly);
    displayTables(sortedData);
});

// Обработчик изменения состояния чекбокса
document.getElementById('originalsOnlyCheckbox').addEventListener('change', function() {
    const showOriginalsOnly = this.checked;
    const sortedData = distributeStudentsByAverageGrade(dataArray, showOriginalsOnly);
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
            provided: values[7]
        };
    });
    return data;
}

// Функция для распределения студентов по специальностям и формам обучения
function distributeStudentsByAverageGrade(data, showOriginalsOnly) {
    const specialtyTables = {};
    const addedStudents = new Set(); // Множество для хранения уникальных студентов

    // Список допустимых специальностей, форм и финансирования
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

    // Отфильтровать студентов по критериям
    const students = data.filter(student => 
        validSpecialties.includes(student.specialty) &&
        validForms.includes(student.form) &&
        validFundings.includes(student.funding) &&
        (student.exam === 'Да' || (specialtiesAllowingNoExam.includes(student.specialty) && student.exam === 'Нет'))
    ).sort((a, b) => b.grade - a.grade); // Сортируем по убыванию оценки

    // Создаем таблицы для каждой специальности и формы
    students.forEach(student => {
        if (!showOriginalsOnly || student.provided === 'Оригинал') {
            const specialtyKey = `${student.specialty}-${student.funding}-${student.form}`;
            
            if (!specialtyTables[specialtyKey]) {
                specialtyTables[specialtyKey] = [];
            }

            // Добавляем студента в таблицу
            specialtyTables[specialtyKey].push(student);
            addedStudents.add(student.name);
        }
    });

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

        // Добавляем новый заголовок для номера
        const numberHeader = document.createElement('th');
        numberHeader.textContent = '№';
        headerRow.appendChild(numberHeader);

        // Остальные заголовки
        ['Name', 'Specialty', 'Grade', 'Exam', 'Funding', 'Form', 'Provided', 'Priority Number'].forEach((text, index) => {
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

            // Добавляем ячейку с номером
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

            const priorityNumberCell = document.createElement('td');
            priorityNumberCell.textContent = item.priority;
            row.appendChild(priorityNumberCell);

            tbody.appendChild(row);
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        outputDiv.appendChild(table);

        // Добавление количества студентов и горизонтальной линии
        const countDiv = document.createElement('div');
        countDiv.classList.add('student-count');
        countDiv.textContent = `Total students: ${data[key].length}`;
        outputDiv.appendChild(countDiv);

        const hr = document.createElement('hr');
        outputDiv.appendChild(hr);
    }
}

// Функция для переключения порядка сортировки
function toggleSortOrder(data, key, index) {
    let order = sortOrder[key] || 'desc'; // По умолчанию по убыванию
    let newOrder = order === 'desc' ? 'asc' : 'desc';
    sortOrder[key] = newOrder;

    // Сортировка данных
    data[key].sort((a, b) => {
        if (index === 2) { // Столбец Grade
            return newOrder === 'asc' ? a.grade - b.grade : b.grade - a.grade;
        }
        // Если нужно добавить сортировку по другим столбцам, добавьте условия здесь
        return 0;
    });

    displayTables(data);
}

// Функция для создания и скачивания PDF
async function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const tables = document.querySelectorAll('#output table');
    let yOffset = 10; // Начальная позиция по вертикали

    for (const table of tables) {
        const headers = [];
        const rows = [];

        // Сбор заголовков таблицы
        table.querySelectorAll('thead th').forEach(th => {
            headers.push(th.textContent);
        });

        // Сбор данных таблицы
        table.querySelectorAll('tbody tr').forEach(tr => {
            const row = [];
            tr.querySelectorAll('td').forEach(td => {
                row.push(td.textContent);
            });
            rows.push(row);
        });

        // Добавление таблицы в PDF
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

        yOffset = doc.autoTable.previous.finalY + 10; // Отступ между таблицами
    }

    // Сохранение PDF
    doc.save('students.pdf');
}

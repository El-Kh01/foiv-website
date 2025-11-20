// Загрузка списка ФОИВов
class FoivManager {
    constructor() {
        this.foivs = [];
        this.currentFoiv = null;
        this.init();
    }

    async init() {
        await this.loadFoivList();
        this.renderFoivList();
        this.setupEventListeners();
    }

    async loadFoivList() {
        try {
            const response = await fetch('data/foiv-list.json');
            this.foivs = await response.json();
        } catch (error) {
            console.error('Ошибка загрузки списка ФОИВов:', error);
        }
    }

    renderFoivList(filterSphere = 'all', searchTerm = '') {
        const foivList = document.getElementById('foivList');
        const filteredFoivs = this.foivs.filter(foiv => {
            const matchesSphere = filterSphere === 'all' || foiv.sphere === filterSphere;
            const matchesSearch = foiv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                foiv.shortName.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSphere && matchesSearch;
        });

        foivList.innerHTML = filteredFoivs.map(foiv => `
            <div class="foiv-item" data-foiv="${foiv.id}">
                <div class="foiv-name">${foiv.name}</div>
                <div class="foiv-short-name">${foiv.shortName}</div>
                <span class="foiv-sphere">${this.getSphereName(foiv.sphere)}</span>
            </div>
        `).join('');

        // Добавляем обработчики событий для элементов списка
        document.querySelectorAll('.foiv-item').forEach(item => {
            item.addEventListener('click', () => {
                this.loadFoivContent(item.dataset.foiv);
            });
        });
    }

    async loadFoivContent(foivId) {
        try {
            // Убираем активный класс у всех элементов
            document.querySelectorAll('.foiv-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Добавляем активный класс к выбранному элементу
            const selectedItem = document.querySelector(`[data-foiv="${foivId}"]`);
            if (selectedItem) {
                selectedItem.classList.add('active');
            }

            const response = await fetch(`foivs/${foivId}.html`);
            if (!response.ok) {
                throw new Error(`Файл не найден: ${foivId}.html`);
            }
            const content = await response.text();
            
            document.getElementById('foivContent').innerHTML = content;
            this.currentFoiv = foivId;
            
            // Инициализируем аккордеон после загрузки контента
            setTimeout(() => this.initAccordion(), 100);
        } catch (error) {
            console.error('Ошибка загрузки контента ФОИВ:', error);
            document.getElementById('foivContent').innerHTML = `
                <div class="error-message">
                    <h3>Ошибка загрузки</h3>
                    <p>Не удалось загрузить информацию о выбранном ФОИВе: ${error.message}</p>
                    <p>Проверьте, существует ли файл foivs/${foivId}.html</p>
                </div>
            `;
        }
    }

    initAccordion() {
        // Удаляем старые обработчики
        const headers = document.querySelectorAll('.section-header');
        headers.forEach(header => {
            const newHeader = header.cloneNode(true);
            header.parentNode.replaceChild(newHeader, header);
        });

        // Добавляем новые обработчики
        document.querySelectorAll('.section-header').forEach(header => {
            header.addEventListener('click', (e) => {
                const section = e.currentTarget.nextElementSibling;
                const icon = e.currentTarget.querySelector('.toggle-icon');
                
                if (section && icon) {
                    section.classList.toggle('active');
                    icon.textContent = section.classList.contains('active') ? '▲' : '▼';
                }
            });

            // Убираем любые onclick атрибуты
            header.removeAttribute('onclick');
        });

        // Автоматически открываем первую секцию
        const firstSection = document.querySelector('.section-content');
        if (firstSection) {
            firstSection.classList.add('active');
            const icon = firstSection.previousElementSibling?.querySelector('.toggle-icon');
            if (icon) {
                icon.textContent = '▲';
            }
        }
    }

    getSphereName(sphereCode) {
        const spheres = {
            'political': 'Политическая',
            'economic': 'Экономическая', 
            'social': 'Социальная',
            'security': 'Безопасность'
        };
        return spheres[sphereCode] || sphereCode;
    }

    setupEventListeners() {
        // Фильтрация по сферам
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderFoivList(btn.dataset.sphere);
            });
        });

        // Поиск
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const activeFilter = document.querySelector('.filter-btn.active');
                if (activeFilter) {
                    this.renderFoivList(activeFilter.dataset.sphere, e.target.value);
                }
            });
        }
    }
}

// Глобальная функция для обратной совместимости
window.toggleSection = function(sectionId) {
    console.warn('toggleSection вызвана глобально - рекомендуется использовать новый подход');
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const icon = section.previousElementSibling?.querySelector('.toggle-icon');
    section.classList.toggle('active');
    if (icon) {
        icon.textContent = section.classList.contains('active') ? '▲' : '▼';
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new FoivManager();
});

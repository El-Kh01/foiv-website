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
            document.querySelector(`[data-foiv="${foivId}"]`).classList.add('active');

            const response = await fetch(`foivs/${foivId}.html`);
            const content = await response.text();
            
            document.getElementById('foivContent').innerHTML = content;
            this.currentFoiv = foivId;
        } catch (error) {
            console.error('Ошибка загрузки контента ФОИВ:', error);
            document.getElementById('foivContent').innerHTML = `
                <div class="error-message">
                    <h3>Ошибка загрузки</h3>
                    <p>Не удалось загрузить информацию о выбранном ФОИВе.</p>
                </div>
            `;
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
        document.getElementById('searchInput').addEventListener('input', (e) => {
            const activeFilter = document.querySelector('.filter-btn.active').dataset.sphere;
            this.renderFoivList(activeFilter, e.target.value);
        });
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new FoivManager();
});

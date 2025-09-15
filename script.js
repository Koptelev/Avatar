// Eywa Tree Game - Interactive Landing Page
class EywaGame {
    constructor() {
        this.leads = [];
        this.deals = [];
        this.clients = [];
        this.animationId = null;
        this.isTreePulsing = false;
        this.scrollTimeout = null;
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // Статистика по филиалам
        this.moscowStats = { leads: 0, payments: 0, points: 0 };
        this.westStats = { leads: 0, payments: 0, points: 0 };
        this.totalStats = { leads: 0, payments: 0, points: 0 };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.generateSampleData();
        this.startAnimations();
        this.setupParallax();
        this.setupSmoothScrolling();
        this.setupBackgroundMusic();
        this.updateStats();
        this.renderLeadsOnTree();
    }

    setupEventListeners() {
        // Navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
            });
        });

        // Mobile navigation toggle
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }

        // Join mission button
        const joinButton = document.getElementById('joinMission');
        if (joinButton) {
            joinButton.addEventListener('click', () => {
                this.showJoinModal();
            });
        }

        // Lead popup
        const popupClose = document.getElementById('popupClose');
        const leadPopup = document.getElementById('leadPopup');
        if (popupClose && leadPopup) {
            popupClose.addEventListener('click', () => {
                this.closeLeadPopup();
            });
            leadPopup.addEventListener('click', (e) => {
                if (e.target === leadPopup) {
                    this.closeLeadPopup();
                }
            });
        }

        // Scroll indicator
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.addEventListener('click', () => {
                this.scrollToSection('mission');
            });
        }

        // Music auto-start (no button needed)

        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Scroll events
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });
    }

    generateSampleData() {
        // Generate sample leads data
        const companies = [
            'ООО "ТехноИнновации"', 'АО "СтройГарант"', 'ИП Иванов А.А.',
            'ООО "МедиаГрупп"', 'АО "ФинансТрейд"', 'ООО "ЭкоСистема"',
            'ИП Петрова М.В.', 'ООО "ЛогистикПро"', 'АО "ТелекомСервис"',
            'ООО "РетейлМаркет"', 'ИП Сидоров К.Л.', 'АО "Промышленник"'
        ];

        const contacts = [
            'Анна Смирнова', 'Дмитрий Козлов', 'Елена Волкова', 'Михаил Новиков',
            'Ольга Морозова', 'Сергей Лебедев', 'Татьяна Соколова', 'Алексей Попов',
            'Наталья Федорова', 'Владимир Медведев', 'Ирина Захарова', 'Андрей Семенов'
        ];

        const branches = ['moscow', 'west']; // Московский и Западный МРЦ

        // Generate 20-30 random leads
        const leadCount = Math.floor(Math.random() * 11) + 20;
        for (let i = 0; i < leadCount; i++) {
            const branch = branches[Math.floor(Math.random() * branches.length)];
            const isPayment = Math.random() > 0.6; // 40% chance of being a payment
            
            const lead = {
                id: i + 1,
                company: companies[Math.floor(Math.random() * companies.length)],
                contact: contacts[Math.floor(Math.random() * contacts.length)],
                date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                type: isPayment ? 'payment' : 'lead',
                branch: branch,
                amount: isPayment ? Math.floor(Math.random() * 100000) + 1000 : 0 // Random payment amount
            };
            this.leads.push(lead);
        }

        // Generate some deals and clients
        this.deals = this.leads.filter(lead => lead.type === 'deal');
        this.clients = this.leads.filter(lead => lead.type === 'client');
        
        // Подсчитываем статистику по филиалам
        this.calculateBranchStats();
    }

    calculateBranchStats() {
        // Сбрасываем статистику
        this.moscowStats = { leads: 0, payments: 0, points: 0 };
        this.westStats = { leads: 0, payments: 0, points: 0 };
        this.totalStats = { leads: 0, payments: 0, points: 0 };

        // Подсчитываем по каждому лиду
        this.leads.forEach(lead => {
            if (lead.branch === 'moscow') {
                if (lead.type === 'lead') {
                    this.moscowStats.leads++;
                } else if (lead.type === 'payment') {
                    this.moscowStats.payments++;
                    this.moscowStats.points += this.calculatePaymentPoints(lead.amount);
                }
            } else if (lead.branch === 'west') {
                if (lead.type === 'lead') {
                    this.westStats.leads++;
                } else if (lead.type === 'payment') {
                    this.westStats.payments++;
                    this.westStats.points += this.calculatePaymentPoints(lead.amount);
                }
            }
        });

        // Подсчитываем баллы за лиды (0-3 = 0 баллов, 4+ = 1 балл)
        this.moscowStats.points += this.calculateLeadPoints(this.moscowStats.leads);
        this.westStats.points += this.calculateLeadPoints(this.westStats.leads);

        // Подсчитываем общую статистику
        this.totalStats.leads = this.moscowStats.leads + this.westStats.leads;
        this.totalStats.payments = this.moscowStats.payments + this.westStats.payments;
        this.totalStats.points = this.moscowStats.points + this.westStats.points;
    }

    calculateLeadPoints(leadCount) {
        // 0-3 лида = 0 баллов, 4+ лидов = 1 балл
        return leadCount >= 4 ? 1 : 0;
    }

    calculatePaymentPoints(amount) {
        // 0-10k=1, 10-30k=10, 30-50k=15, 50k+=25
        if (amount < 10000) return 1;
        if (amount < 30000) return 10;
        if (amount < 50000) return 15;
        return 25;
    }

    startAnimations() {
        // Skip animations if user prefers reduced motion
        if (this.isReducedMotion) {
            this.animateStats();
            return;
        }
        
        // Tree pulsing animation
        this.startTreePulse();
        
        // Particle animation
        this.animateParticles();
        
        // Stats counter animation
        this.animateStats();
        
        // Add new leads periodically
        this.simulateNewLeads();
    }

    startTreePulse() {
        const tree = document.getElementById('eywaTree');
        if (!tree || this.isTreePulsing) return;
        
        this.isTreePulsing = true;
        const pulse = () => {
            tree.style.transform = 'scale(1.02)';
            setTimeout(() => {
                tree.style.transform = 'scale(1)';
            }, 1000);
            setTimeout(pulse, 5000);
        };
        pulse();
    }

    animateParticles() {
        const particles = document.querySelectorAll('.particle');
        particles.forEach((particle, index) => {
            const delay = index * 0.3;
            const duration = 8 + Math.random() * 4; // 8-12 seconds
            setTimeout(() => {
                particle.style.animation = `float ${duration}s ease-in-out infinite`;
                particle.style.animationDelay = `${Math.random() * 2}s`;
            }, delay * 1000);
        });
    }

    animateStats() {
        const moscowStats = {
            leads: document.getElementById('moscowLeads'),
            payments: document.getElementById('moscowPayments'),
            points: document.getElementById('moscowPoints')
        };

        const westStats = {
            leads: document.getElementById('westLeads'),
            payments: document.getElementById('westPayments'),
            points: document.getElementById('westPoints')
        };

        const totalStats = {
            leads: document.getElementById('totalLeads'),
            payments: document.getElementById('totalPayments'),
            points: document.getElementById('totalPoints')
        };

        // Анимируем статистику Московского МРЦ
        Object.keys(moscowStats).forEach(key => {
            if (moscowStats[key]) {
                this.animateCounter(moscowStats[key], 0, this.moscowStats[key], 2000);
            }
        });

        // Анимируем статистику Западного МРЦ
        Object.keys(westStats).forEach(key => {
            if (westStats[key]) {
                this.animateCounter(westStats[key], 0, this.westStats[key], 2000);
            }
        });

        // Анимируем общую статистику
        Object.keys(totalStats).forEach(key => {
            if (totalStats[key]) {
                this.animateCounter(totalStats[key], 0, this.totalStats[key], 2000);
            }
        });
    }

    animateCounter(element, start, end, duration) {
        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(start + (end - start) * this.easeOutQuart(progress));
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }

    easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    simulateNewLeads() {
        setInterval(() => {
            if (Math.random() > 0.7) { // 30% chance every 5 seconds
                this.addNewLead();
            }
        }, 5000);
    }

    addNewLead() {
        const companies = ['ООО "НоваяКомпания"', 'АО "СтартапИнк"', 'ИП НовыйКлиент'];
        const contacts = ['Новый Контакт', 'Активный Лид', 'Потенциальный Клиент'];
        const branches = ['moscow', 'west'];
        
        const branch = branches[Math.floor(Math.random() * branches.length)];
        const isPayment = Math.random() > 0.7; // 30% chance of being a payment
        
        const newLead = {
            id: this.leads.length + 1,
            company: companies[Math.floor(Math.random() * companies.length)],
            contact: contacts[Math.floor(Math.random() * contacts.length)],
            date: new Date(),
            type: isPayment ? 'payment' : 'lead',
            branch: branch,
            amount: isPayment ? Math.floor(Math.random() * 100000) + 1000 : 0
        };
        
        this.leads.push(newLead);
        this.calculateBranchStats();
        this.updateStats();
        this.renderLeadsOnTree();
        this.showNewLeadNotification(newLead);
        this.animateNewLeadDot(newLead);
    }

    animateNewLeadDot(lead) {
        const container = document.getElementById('leadsContainer');
        if (!container) return;
        
        // Find the last added dot (should be the new lead)
        const dots = container.querySelectorAll('.lead-dot');
        const newDot = dots[dots.length - 1];
        
        if (newDot) {
            // Add special animation for new lead
            newDot.style.animation = 'newLeadAppear 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
            newDot.style.transform = 'scale(0) rotateZ(180deg)';
            newDot.style.opacity = '0';
            
            // Add ripple effect
            this.createRippleEffect(newDot);
            
            setTimeout(() => {
                newDot.style.transform = 'scale(1) rotateZ(0deg)';
                newDot.style.opacity = '1';
                newDot.style.animation = 'leadPulse 3s ease-in-out infinite';
            }, 200);
        }
    }
    
    createRippleEffect(element) {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 100px;
            height: 100px;
            border: 2px solid currentColor;
            border-radius: 50%;
            transform: translate(-50%, -50%) scale(0);
            opacity: 0.8;
            pointer-events: none;
            animation: rippleExpand 1s ease-out;
        `;
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 1000);
    }

    showNewLeadNotification(lead) {
        // Уведомления отключены
        return;
    }

    renderLeadsOnTree() {
        const container = document.getElementById('leadsContainer');
        if (!container) return;
        
        // Clear existing leads
        container.innerHTML = '';
        
        // Render leads as dots on the tree
        this.leads.forEach((lead, index) => {
            const dot = document.createElement('div');
            dot.className = 'lead-dot';
            
            // Determine dot type and color based on branch and type
            if (lead.branch === 'moscow') {
                // Московский МРЦ (Племя Воздуха) - синие огоньки
                if (lead.type === 'payment') {
                    dot.classList.add('dot-air-payment');
                } else {
                    dot.classList.add('dot-air-lead');
                }
            } else if (lead.branch === 'west') {
                // Западный МРЦ (Племя Воды) - фиолетовые огоньки
                if (lead.type === 'payment') {
                    dot.classList.add('dot-water-payment');
                } else {
                    dot.classList.add('dot-water-lead');
                }
            }
            
            // Position dots on the tree image - only in upper 2/3 (0-67%)
            const positions = [
                // Top branches and leaves
                { top: '10%', left: '25%' },
                { top: '12%', left: '35%' },
                { top: '15%', left: '45%' },
                { top: '10%', right: '25%' },
                { top: '12%', right: '35%' },
                { top: '15%', right: '45%' },
                
                // Middle branches
                { top: '20%', left: '20%' },
                { top: '25%', left: '30%' },
                { top: '30%', left: '40%' },
                { top: '20%', right: '20%' },
                { top: '25%', right: '30%' },
                { top: '30%', right: '40%' },
                
                // Lower branches (still in upper 2/3)
                { top: '35%', left: '25%' },
                { top: '40%', left: '35%' },
                { top: '45%', left: '45%' },
                { top: '35%', right: '25%' },
                { top: '40%', right: '35%' },
                { top: '45%', right: '45%' },
                
                // Trunk area (upper part only)
                { top: '50%', left: '38%' },
                { top: '55%', left: '42%' },
                { top: '60%', left: '46%' },
                { top: '50%', right: '38%' },
                { top: '55%', right: '42%' },
                { top: '60%', right: '46%' },
                
                // Additional scattered positions (upper 2/3 only)
                { top: '18%', left: '15%' },
                { top: '38%', left: '15%' },
                { top: '18%', right: '15%' },
                { top: '38%', right: '15%' },
                
                // More positions in upper 2/3
                { top: '22%', left: '50%' },
                { top: '28%', left: '50%' },
                { top: '32%', left: '50%' },
                { top: '42%', left: '50%' },
                { top: '48%', left: '50%' },
                { top: '52%', left: '50%' },
                { top: '58%', left: '50%' },
                { top: '62%', left: '50%' }
            ];
            
            const position = positions[index % positions.length];
            Object.assign(dot.style, position);
            
            // Add click event
            dot.addEventListener('click', () => {
                this.showLeadPopup(lead);
            });
            
            // Add entrance animation
            dot.style.opacity = '0';
            dot.style.transform = 'scale(0)';
            container.appendChild(dot);
            
            setTimeout(() => {
                dot.style.transition = 'all 0.5s ease';
                dot.style.opacity = '1';
                dot.style.transform = 'scale(1)';
            }, index * 100);
        });
    }

    showLeadPopup(lead) {
        const popup = document.getElementById('leadPopup');
        const company = document.getElementById('leadCompany');
        const contact = document.getElementById('leadContact');
        const status = document.getElementById('leadStatus');
        const date = document.getElementById('leadDate');
        
        if (popup && company && contact && status && date) {
            company.textContent = lead.company;
            contact.textContent = lead.contact;
            status.textContent = lead.status;
            date.textContent = lead.date.toLocaleDateString('ru-RU');
            
            popup.classList.add('active');
        }
    }

    closeLeadPopup() {
        const popup = document.getElementById('leadPopup');
        if (popup) {
            popup.classList.remove('active');
        }
    }

    updateStats() {
        // Обновляем статистику Московского МРЦ
        const moscowLeads = document.getElementById('moscowLeads');
        const moscowPayments = document.getElementById('moscowPayments');
        const moscowPoints = document.getElementById('moscowPoints');
        
        if (moscowLeads) moscowLeads.textContent = this.moscowStats.leads;
        if (moscowPayments) moscowPayments.textContent = this.moscowStats.payments;
        if (moscowPoints) moscowPoints.textContent = this.moscowStats.points;

        // Обновляем статистику Западного МРЦ
        const westLeads = document.getElementById('westLeads');
        const westPayments = document.getElementById('westPayments');
        const westPoints = document.getElementById('westPoints');
        
        if (westLeads) westLeads.textContent = this.westStats.leads;
        if (westPayments) westPayments.textContent = this.westStats.payments;
        if (westPoints) westPoints.textContent = this.westStats.points;

        // Обновляем общую статистику
        const totalLeads = document.getElementById('totalLeads');
        const totalPayments = document.getElementById('totalPayments');
        const totalPoints = document.getElementById('totalPoints');
        
        if (totalLeads) totalLeads.textContent = this.totalStats.leads;
        if (totalPayments) totalPayments.textContent = this.totalStats.payments;
        if (totalPoints) totalPoints.textContent = this.totalStats.points;
    }

    setupParallax() {
        const parallaxElements = document.querySelectorAll('.eywa-tree, .tree-glow');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            parallaxElements.forEach(element => {
                element.style.transform = `translateY(${rate}px)`;
            });
        });
    }

    setupSmoothScrolling() {
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupBackgroundMusic() {
        const backgroundMusic = document.getElementById('backgroundMusic');
        if (!backgroundMusic) return;

        // Устанавливаем громкость (30% от максимальной)
        backgroundMusic.volume = 0.3;

        // Устанавливаем автозапуск и зацикливание
        backgroundMusic.loop = true;
        backgroundMusic.autoplay = true;

        // Пытаемся запустить музыку при загрузке страницы
        const playMusic = async () => {
            try {
                await backgroundMusic.play();
                console.log('Фоновая музыка запущена автоматически');
            } catch (error) {
                console.log('Автовоспроизведение заблокировано браузером:', error);
                // Если автовоспроизведение заблокировано, показываем кнопку для запуска
                this.showMusicPlayButton();
            }
        };

        // Запускаем музыку после небольшой задержки
        setTimeout(playMusic, 1000);

        // Обработка ошибок загрузки
        backgroundMusic.addEventListener('error', (e) => {
            console.error('Ошибка загрузки музыки:', e);
        });

        // Обработка окончания загрузки
        backgroundMusic.addEventListener('canplaythrough', () => {
            console.log('Музыка готова к воспроизведению');
        });
    }

    showMusicPlayButton() {
        // Создаем кнопку для запуска музыки
        const playButton = document.createElement('button');
        playButton.id = 'musicPlayButton';
        playButton.innerHTML = '🎵 Включить музыку';
        playButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(45deg, var(--primary-green), var(--bioluminescent-blue));
            color: var(--cosmic-black);
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 5px 15px rgba(0, 255, 136, 0.3);
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        `;

        playButton.addEventListener('click', async () => {
            const backgroundMusic = document.getElementById('backgroundMusic');
            if (backgroundMusic) {
                try {
                    await backgroundMusic.play();
                    playButton.remove();
                    console.log('Музыка запущена пользователем');
                } catch (error) {
                    console.error('Ошибка воспроизведения:', error);
                }
            }
        });

        playButton.addEventListener('mouseenter', () => {
            playButton.style.transform = 'translateY(-2px)';
            playButton.style.boxShadow = '0 8px 20px rgba(0, 255, 136, 0.4)';
        });

        playButton.addEventListener('mouseleave', () => {
            playButton.style.transform = 'translateY(0)';
            playButton.style.boxShadow = '0 5px 15px rgba(0, 255, 136, 0.3)';
        });

        document.body.appendChild(playButton);
    }

    // Music functions removed - music now plays automatically

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    showJoinModal() {
        // Create modal for joining the mission
        const modal = document.createElement('div');
        modal.className = 'join-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Присоединиться к миссии</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Готовы спасти Эйву? Заполните форму ниже, чтобы присоединиться к миссии!</p>
                    <form class="join-form">
                        <div class="form-group">
                            <label for="name">Ваше имя</label>
                            <input type="text" id="name" name="name" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label for="department">Отдел</label>
                            <select id="department" name="department" required>
                                <option value="">Выберите отдел</option>
                                <option value="sales">Продажи</option>
                                <option value="marketing">Маркетинг</option>
                                <option value="support">Поддержка</option>
                                <option value="development">Разработка</option>
                            </select>
                        </div>
                        <button type="submit" class="submit-btn">Присоединиться</button>
                    </form>
                </div>
            </div>
        `;
        
        // Add modal styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        `;
        
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.cssText = `
            background: var(--cosmic-dark);
            padding: 2rem;
            border-radius: 20px;
            border: 2px solid var(--primary-green);
            box-shadow: 0 20px 40px rgba(0, 255, 136, 0.3);
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            transform: scale(0.8);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(modal);
        
        // Animate in
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.style.visibility = 'visible';
            modalContent.style.transform = 'scale(1)';
        }, 100);
        
        // Close modal events
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            this.closeModal(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modal);
            }
        });
        
        // Form submission
        const form = modal.querySelector('.join-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission(form);
        });
    }

    closeModal(modal) {
        const modalContent = modal.querySelector('.modal-content');
        modal.style.opacity = '0';
        modal.style.visibility = 'hidden';
        modalContent.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    }

    handleFormSubmission(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Simulate form submission
        console.log('Form submitted:', data);
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--primary-green); margin-bottom: 1rem;"></i>
                <h3 style="color: var(--primary-green); margin-bottom: 1rem;">Добро пожаловать в миссию!</h3>
                <p>Вы успешно присоединились к спасению Эйвы. Удачи в достижении целей!</p>
            </div>
        `;
        
        form.parentNode.replaceChild(successMsg, form);
        
        // Close modal after 3 seconds
        setTimeout(() => {
            const modal = successMsg.closest('.join-modal');
            if (modal) {
                this.closeModal(modal);
            }
        }, 3000);
    }

    handleResize() {
        // Recalculate tree positions on resize
        this.renderLeadsOnTree();
    }

    handleScroll() {
        // Throttle scroll events for better performance
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }
        
        this.scrollTimeout = setTimeout(() => {
            const scrolled = window.pageYOffset;
            const header = document.querySelector('.header');
            
            // Header background opacity based on scroll
            if (header) {
                const opacity = Math.min(scrolled / 100, 0.95);
                header.style.background = `rgba(10, 10, 10, ${opacity})`;
            }
            
            // Parallax effects (only on desktop)
            if (window.innerWidth > 768) {
                const parallaxElements = document.querySelectorAll('.eywa-tree, .tree-glow');
                const rate = scrolled * -0.3;
                
                parallaxElements.forEach(element => {
                    element.style.transform = `translateY(${rate}px)`;
                });
            }
            
            // Section visibility animations
            this.animateOnScroll();
        }, 16); // ~60fps
    }

    animateOnScroll() {
        const sections = document.querySelectorAll('section');
        const windowHeight = window.innerHeight;
        
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const sectionVisible = sectionTop < windowHeight * 0.8;
            
            if (sectionVisible) {
                section.classList.add('animate-in');
            }
        });
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EywaGame();
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        animation: slideInUp 0.8s ease forwards;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(50px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes rippleExpand {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0.8;
        }
        100% {
            transform: translate(-50%, -50%) scale(3);
            opacity: 0;
        }
    }
    
    .nav-menu.active {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: rgba(10, 10, 10, 0.95);
        backdrop-filter: blur(10px);
        padding: 1rem;
        border-top: 1px solid rgba(0, 255, 136, 0.2);
    }
    
    .nav-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .nav-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .nav-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
    
    .join-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .form-group label {
        color: var(--primary-green);
        font-weight: 600;
    }
    
    .form-group input,
    .form-group select {
        padding: 0.75rem;
        border: 1px solid rgba(0, 255, 136, 0.3);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-light);
        font-size: 1rem;
    }
    
    .form-group input:focus,
    .form-group select:focus {
        outline: none;
        border-color: var(--primary-green);
        box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
    }
    
    .submit-btn {
        padding: 1rem;
        background: linear-gradient(45deg, var(--primary-green), var(--bioluminescent-blue));
        color: var(--cosmic-black);
        border: none;
        border-radius: 8px;
        font-weight: 700;
        font-size: 1.1rem;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .submit-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 255, 136, 0.3);
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(0, 255, 136, 0.2);
    }
    
    .modal-header h3 {
        font-family: 'Orbitron', monospace;
        color: var(--primary-green);
        margin: 0;
    }
    
    .modal-close {
        background: none;
        border: none;
        color: var(--primary-green);
        font-size: 1.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .modal-close:hover {
        color: var(--text-light);
        transform: scale(1.2);
    }
    
    .modal-body p {
        margin-bottom: 1.5rem;
        color: var(--text-light);
        opacity: 0.9;
    }
`;
document.head.appendChild(style);

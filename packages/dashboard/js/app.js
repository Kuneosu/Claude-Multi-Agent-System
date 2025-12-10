/**
 * Multi-Agent Terminal Dashboard
 * Main Application Logic - Iteration 3
 * Features: Loading screen, Help modal, Tooltips, Accessibility, Performance
 */

const AgentDashboard = {
    // Configuration
    config: {
        agents: [
            { id: 'orchestrator', name: 'ORC', fullName: 'Orchestrator', port: 7681, image: '/assets/orchestrator.png' },
            { id: 'requirement-analyst', name: 'REQ', fullName: 'Requirement Analyst', port: 7682, image: '/assets/requirements-analyst.png' },
            { id: 'ux-designer', name: 'UX', fullName: 'UX Designer', port: 7683, image: '/assets/ux-designer.png' },
            { id: 'tech-architect', name: 'TECH', fullName: 'Tech Architect', port: 7684, image: '/assets/tech-architect.png' },
            { id: 'planner', name: 'PLAN', fullName: 'Planner', port: 7685, image: '/assets/planner.png' },
            { id: 'test-designer', name: 'TEST', fullName: 'Test Designer', port: 7686, image: '/assets/test-designer.png' },
            { id: 'developer', name: 'DEV', fullName: 'Developer', port: 7687, image: '/assets/developer.png' },
            { id: 'reviewer', name: 'REV', fullName: 'Reviewer', port: 7688, image: '/assets/reviewer.png' },
            { id: 'documenter', name: 'DOC', fullName: 'Documenter', port: 7689, image: '/assets/documenter.png' }
        ],
        pollInterval: 3000,
        reconnectAttempts: 3,
        reconnectDelay: 2000,
        loadingMinDuration: 800,    // Minimum loading screen duration (ms)
        statusApiPort: 3001,
        agentRoles: {
            'orchestrator': '전체 개발 프로세스를 관리하고 다른 에이전트들을 조율하는 중앙 제어 역할',
            'requirement-analyst': '사용자 요구사항을 분석하고 명세서를 작성하는 역할',
            'ux-designer': '사용자 경험과 인터페이스를 설계하는 역할',
            'tech-architect': '기술 아키텍처와 시스템 구조를 설계하는 역할',
            'planner': '구현 계획을 수립하고 작업을 분배하는 역할',
            'test-designer': '테스트 전략과 테스트 케이스를 설계하는 역할',
            'developer': '실제 코드를 구현하는 개발 역할',
            'reviewer': '코드 품질을 검토하고 피드백을 제공하는 역할',
            'documenter': '문서화 작업을 담당하는 역할'
        }
    },

    // Application State
    state: {
        activeTab: 0,
        agentStatuses: {},
        runningStatuses: {}, // running/stopped state for each agent
        connectionStatus: {},
        reconnectAttempts: {},
        pollingInterval: null,
        isPolling: false,
        isLoading: true,
        isHelpModalOpen: false,
        isShutdownModalOpen: false,
        loadedIframes: 0,
        viewMode: 'split', // 'tab' | 'split' - default to split view
        mainAgentIndex: 0, // Index of main terminal in split view
        statusCoverEnabled: true, // Status Cover on/off in split view grid
        contextMenuAgentId: null, // Currently selected agent for context menu
        isAgentInfoModalOpen: false
    },

    // DOM Elements Cache
    elements: {
        tabs: null,
        iframes: null,
        statusAnnouncer: null,
        terminalContainer: null,
        connectionStatusDot: null,
        connectionStatusText: null,
        loadingScreen: null,
        helpModal: null,
        helpButton: null,
        helpModalClose: null,
        viewToggleButton: null,
        coverToggleButton: null,
        splitViewContainer: null,
        contextMenu: null,
        contextMenuToggle: null,
        contextMenuToggleText: null,
        contextMenuInfo: null,
        agentInfoModal: null,
        agentInfoModalClose: null,
        agentRoleSummary: null,
        agentClaudeMdContent: null,
        shutdownButton: null,
        shutdownModal: null,
        shutdownModalClose: null,
        prepShutdownBtn: null,
        fullShutdownBtn: null,
        restartAllBtn: null,
        cancelShutdownBtn: null
    },

    /**
     * Initialize the dashboard
     */
    init() {
        const startTime = Date.now();

        // Cache DOM elements
        this.cacheElements();

        // Initialize agent statuses
        this.initializeAgentStates();

        // Set up event listeners
        this.setupTabListeners();
        this.setupKeyboardShortcuts();
        this.setupIframeListeners();
        this.setupHelpModal();
        this.setupViewToggle();
        this.setupCoverToggle();
        this.setupContextMenu();
        this.setupAgentInfoModal();
        this.setupShutdownModal();
        this.createSplitViewContainer();

        // Set initial view mode (split view by default)
        if (this.state.viewMode === 'split') {
            this.enableSplitView();
        } else {
            this.switchTab(0);
        }

        // Immediate status sync before polling starts
        this.pollStatus();

        // Start status polling
        this.startPolling();

        // Create reconnect overlay
        this.createReconnectOverlay();

        // Hide loading screen after minimum duration
        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(0, this.config.loadingMinDuration - elapsed);

        setTimeout(() => {
            this.hideLoadingScreen();
        }, remainingDelay);

        console.log('AgentDashboard initialized (Iteration 3)');
    },

    /**
     * Cache all DOM elements
     */
    cacheElements() {
        this.elements.tabs = document.querySelectorAll('.tab-button');
        this.elements.iframes = document.querySelectorAll('.terminal-iframe');
        this.elements.statusAnnouncer = document.getElementById('status-announcer');
        this.elements.terminalContainer = document.getElementById('terminal-area');
        this.elements.connectionStatusDot = document.querySelector('.connection-status .status-dot');
        this.elements.connectionStatusText = document.querySelector('.connection-status .status-text');
        this.elements.loadingScreen = document.getElementById('loading-screen');
        this.elements.helpModal = document.getElementById('help-modal');
        this.elements.helpButton = document.getElementById('help-button');
        this.elements.helpModalClose = document.getElementById('help-modal-close');
        this.elements.viewToggleButton = document.getElementById('view-toggle-button');
        this.elements.coverToggleButton = document.getElementById('cover-toggle-button');
        this.elements.contextMenu = document.getElementById('agent-context-menu');
        this.elements.contextMenuToggle = document.getElementById('context-menu-toggle');
        this.elements.contextMenuToggleText = document.getElementById('context-menu-toggle-text');
        this.elements.contextMenuInfo = document.getElementById('context-menu-info');
        this.elements.agentInfoModal = document.getElementById('agent-info-modal');
        this.elements.agentInfoModalClose = document.getElementById('agent-info-modal-close');
        this.elements.agentRoleSummary = document.getElementById('agent-role-summary');
        this.elements.agentClaudeMdContent = document.getElementById('agent-claude-md-content');
        this.elements.shutdownButton = document.getElementById('shutdown-button');
        this.elements.shutdownModal = document.getElementById('shutdown-modal');
        this.elements.shutdownModalClose = document.getElementById('shutdown-modal-close');
        this.elements.prepShutdownBtn = document.getElementById('prep-shutdown-btn');
        this.elements.fullShutdownBtn = document.getElementById('full-shutdown-btn');
        this.elements.restartAllBtn = document.getElementById('restart-all-btn');
        this.elements.cancelShutdownBtn = document.getElementById('cancel-shutdown-btn');
    },

    /**
     * Initialize agent states
     */
    initializeAgentStates() {
        this.config.agents.forEach(agent => {
            this.state.agentStatuses[agent.id] = 'idle';
            this.state.runningStatuses[agent.id] = null; // unknown until first poll
            this.state.connectionStatus[agent.id] = 'unknown';
            this.state.reconnectAttempts[agent.id] = 0;
        });
    },

    /**
     * Hide loading screen with animation
     */
    hideLoadingScreen() {
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.classList.add('hidden');
            this.state.isLoading = false;

            // Remove from DOM after animation
            setTimeout(() => {
                if (this.elements.loadingScreen && this.elements.loadingScreen.parentNode) {
                    this.elements.loadingScreen.remove();
                }
            }, 400);
        }
    },

    /**
     * Set up help modal functionality
     */
    setupHelpModal() {
        // Help button click
        if (this.elements.helpButton) {
            this.elements.helpButton.addEventListener('click', () => {
                this.toggleHelpModal();
            });
        }

        // Close button click
        if (this.elements.helpModalClose) {
            this.elements.helpModalClose.addEventListener('click', () => {
                this.closeHelpModal();
            });
        }

        // Click outside modal to close
        if (this.elements.helpModal) {
            this.elements.helpModal.addEventListener('click', (e) => {
                if (e.target === this.elements.helpModal) {
                    this.closeHelpModal();
                }
            });
        }
    },

    /**
     * Toggle help modal visibility
     */
    toggleHelpModal() {
        if (this.state.isHelpModalOpen) {
            this.closeHelpModal();
        } else {
            this.openHelpModal();
        }
    },

    /**
     * Open help modal
     */
    openHelpModal() {
        if (this.elements.helpModal) {
            this.elements.helpModal.classList.add('visible');
            this.state.isHelpModalOpen = true;

            // Focus the close button for accessibility
            if (this.elements.helpModalClose) {
                this.elements.helpModalClose.focus();
            }

            // Trap focus within modal
            this.trapFocus(this.elements.helpModal);
        }
    },

    /**
     * Close help modal
     */
    closeHelpModal() {
        if (this.elements.helpModal) {
            this.elements.helpModal.classList.remove('visible');
            this.state.isHelpModalOpen = false;

            // Return focus to help button
            if (this.elements.helpButton) {
                this.elements.helpButton.focus();
            }
        }
    },

    /**
     * Trap focus within an element (for modal accessibility)
     */
    trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        const handleTabKey = (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        };

        element.addEventListener('keydown', handleTabKey);
    },

    /**
     * Set up tab click event listeners
     */
    setupTabListeners() {
        this.elements.tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                this.switchTab(index);
            });

            // Keyboard navigation within tabs
            tab.addEventListener('keydown', (e) => {
                this.handleTabKeyNavigation(e, index);
            });
        });
    },

    /**
     * Set up iframe load/error event listeners
     */
    setupIframeListeners() {
        this.elements.iframes.forEach((iframe, index) => {
            const agent = this.config.agents[index];

            iframe.addEventListener('load', () => {
                this.handleIframeLoad(agent.id);
            });

            iframe.addEventListener('error', () => {
                this.handleIframeError(agent.id);
            });
        });
    },

    /**
     * Handle iframe load success
     */
    handleIframeLoad(agentId) {
        this.state.connectionStatus[agentId] = 'connected';
        this.state.reconnectAttempts[agentId] = 0;
        this.state.loadedIframes++;
        this.hideReconnectOverlay(agentId);
        this.updateConnectionUI();
        console.log(`Connected to ${agentId}`);
    },

    /**
     * Handle iframe load error
     */
    handleIframeError(agentId) {
        this.state.connectionStatus[agentId] = 'disconnected';
        this.updateConnectionUI();
        console.warn(`Connection failed for ${agentId}`);

        if (this.state.reconnectAttempts[agentId] < this.config.reconnectAttempts) {
            this.attemptReconnect(agentId);
        } else {
            this.showReconnectOverlay(agentId);
        }
    },

    /**
     * Handle keyboard navigation within tab list
     */
    handleTabKeyNavigation(event, currentIndex) {
        let newIndex = currentIndex;

        switch (event.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                event.preventDefault();
                newIndex = (currentIndex + 1) % this.config.agents.length;
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                event.preventDefault();
                newIndex = (currentIndex - 1 + this.config.agents.length) % this.config.agents.length;
                break;
            case 'Home':
                event.preventDefault();
                newIndex = 0;
                break;
            case 'End':
                event.preventDefault();
                newIndex = this.config.agents.length - 1;
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                this.switchTab(currentIndex);
                return;
            default:
                return;
        }

        this.elements.tabs[newIndex].focus();
    },

    /**
     * Set up global keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            const activeEl = document.activeElement;
            const isTerminalFocused = activeEl?.tagName === 'IFRAME' ||
                                      activeEl?.closest('.terminal-container') ||
                                      activeEl?.closest('.split-view-main');

            // Skip shortcuts if terminal has focus - let terminal handle key events
            if (isTerminalFocused) {
                return;
            }

            // Only handle specific dashboard shortcuts, ignore everything else
            const isDashboardShortcut =
                e.key === 'Escape' ||
                e.key === '?' ||
                (e.key === 'v' || e.key === 'V') ||
                (e.key === 'c' || e.key === 'C') ||
                (e.ctrlKey && e.key >= '1' && e.key <= '9') ||
                (e.ctrlKey && e.key === 'Tab');

            if (!isDashboardShortcut) {
                return;
            }

            // Escape: Close modals
            if (e.key === 'Escape') {
                if (this.state.isShutdownModalOpen) {
                    e.preventDefault();
                    this.closeShutdownModal();
                    return;
                }
                if (this.state.isHelpModalOpen) {
                    e.preventDefault();
                    this.closeHelpModal();
                    return;
                }
            }

            // ?: Toggle help modal
            if (e.key === '?' && !e.ctrlKey && !e.altKey) {
                e.preventDefault();
                this.toggleHelpModal();
                return;
            }

            // V: Toggle view mode
            if ((e.key === 'v' || e.key === 'V') && !e.ctrlKey && !e.altKey && !e.metaKey) {
                e.preventDefault();
                this.toggleViewMode();
                return;
            }

            // C: Toggle status cover (only in split view mode)
            if ((e.key === 'c' || e.key === 'C') && !e.ctrlKey && !e.altKey && !e.metaKey) {
                if (this.state.viewMode === 'split') {
                    e.preventDefault();
                    this.toggleStatusCover();
                }
                return;
            }

            // Don't process shortcuts when modal is open
            if (this.state.isHelpModalOpen) return;

            // Ctrl + 1-9: Switch to specific tab
            if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
                e.preventDefault();
                const index = parseInt(e.key) - 1;
                if (index < this.config.agents.length) {
                    this.switchTab(index);
                }
            }

            // Ctrl + Tab: Next tab
            if (e.ctrlKey && e.key === 'Tab' && !e.shiftKey) {
                e.preventDefault();
                const nextIndex = (this.state.activeTab + 1) % this.config.agents.length;
                this.switchTab(nextIndex);
            }

            // Ctrl + Shift + Tab: Previous tab
            if (e.ctrlKey && e.shiftKey && e.key === 'Tab') {
                e.preventDefault();
                const prevIndex = (this.state.activeTab - 1 + this.config.agents.length) % this.config.agents.length;
                this.switchTab(prevIndex);
            }
        });
    },

    /**
     * Switch to a specific tab
     */
    switchTab(index) {
        if (index < 0 || index >= this.config.agents.length) {
            console.warn(`Invalid tab index: ${index}`);
            return;
        }

        this.state.activeTab = index;

        // Update tab buttons
        this.elements.tabs.forEach((tab, i) => {
            const isActive = i === index;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', isActive.toString());
            tab.setAttribute('tabindex', isActive ? '0' : '-1');
        });

        // Update iframe visibility
        this.elements.iframes.forEach((iframe, i) => {
            iframe.classList.toggle('hidden', i !== index);
        });

        // Focus the active tab's iframe
        const activeIframe = this.elements.iframes[index];
        if (activeIframe) {
            activeIframe.focus();
        }

        // Update reconnect overlay visibility
        this.updateReconnectOverlayVisibility();

        // Announce change for screen readers
        const agent = this.config.agents[index];
        const status = this.state.agentStatuses[agent.id];
        this.announceStatus(`${agent.fullName} 터미널 활성화됨. 상태: ${status}`);

        console.log(`Switched to tab ${index}: ${agent.id}`);
    },

    /**
     * Update reconnect overlay visibility based on active tab
     */
    updateReconnectOverlayVisibility() {
        const activeAgent = this.config.agents[this.state.activeTab];
        const overlay = document.getElementById('reconnect-overlay');

        if (overlay) {
            const isDisconnected = this.state.connectionStatus[activeAgent.id] === 'disconnected' &&
                                   this.state.reconnectAttempts[activeAgent.id] >= this.config.reconnectAttempts;
            overlay.classList.toggle('visible', isDisconnected);
        }
    },

    /**
     * Start status polling
     */
    startPolling() {
        if (this.state.isPolling) return;

        this.state.isPolling = true;
        this.pollStatus();

        this.state.pollingInterval = setInterval(() => {
            this.pollStatus();
        }, this.config.pollInterval);

        console.log('Status polling started');
    },

    /**
     * Stop status polling
     */
    stopPolling() {
        if (this.state.pollingInterval) {
            clearInterval(this.state.pollingInterval);
            this.state.pollingInterval = null;
        }
        this.state.isPolling = false;
        console.log('Status polling stopped');
    },

    /**
     * Poll agent statuses using batch API
     */
    async pollStatus() {
        try {
            const response = await fetch('/api/agents/status', {
                method: 'GET',
                cache: 'no-cache'
            });

            if (response.ok) {
                const data = await response.json();

                for (const [agentId, agentData] of Object.entries(data)) {
                    const agent = this.config.agents.find(a => a.id === agentId);
                    if (!agent) continue;

                    // Update work status (idle/working/error)
                    const newStatus = agentData.status || 'idle';
                    const oldStatus = this.state.agentStatuses[agentId];

                    if (newStatus !== oldStatus) {
                        this.state.agentStatuses[agentId] = newStatus;
                        this.updateStatusIndicator(agentId);

                        if (newStatus === 'error') {
                            this.announceStatus(`${agent.name} 에이전트 에러 발생`);
                        } else if (newStatus === 'working' && oldStatus !== 'working') {
                            this.announceStatus(`${agent.name} 에이전트 작업 시작`);
                        }
                    }

                    // Update running status (running/stopped)
                    const newRunning = agentData.running;
                    const oldRunning = this.state.runningStatuses[agentId];

                    if (newRunning !== oldRunning) {
                        this.state.runningStatuses[agentId] = newRunning;
                        this.updateStatusCover(agentId);
                    }
                }
            }
        } catch (error) {
            // Silently handle - API may not be available
        }
    },

    /**
     * Render tabs
     */
    renderTabs() {
        this.elements.tabs.forEach((tab, index) => {
            const agent = this.config.agents[index];
            const status = this.state.agentStatuses[agent.id] || 'idle';

            const indicator = tab.querySelector('.status-indicator');
            if (indicator) {
                indicator.className = `status-indicator ${status}`;
                indicator.setAttribute('aria-label', this.getStatusLabel(status));
            }

            tab.classList.toggle('error', status === 'error');
        });
    },

    /**
     * Get human-readable status label
     */
    getStatusLabel(status) {
        const labels = {
            'idle': '대기 중',
            'working': '작업 중',
            'error': '에러'
        };
        return labels[status] || '알 수 없음';
    },

    /**
     * Update status indicator for a specific agent
     */
    updateStatusIndicator(agentId) {
        const index = this.config.agents.findIndex(a => a.id === agentId);
        if (index === -1) return;

        const tab = this.elements.tabs[index];
        const status = this.state.agentStatuses[agentId] || 'idle';
        const indicator = tab.querySelector('.status-indicator');

        if (indicator) {
            indicator.className = `status-indicator ${status}`;
            indicator.setAttribute('aria-label', this.getStatusLabel(status));
        }

        tab.classList.toggle('error', status === 'error');

        // Update Status Cover in split view
        if (this.state.viewMode === 'split') {
            this.updateStatusCover(agentId);
        }
    },

    /**
     * Update global connection status UI
     */
    updateConnectionUI() {
        const connectedCount = Object.values(this.state.connectionStatus)
            .filter(status => status === 'connected').length;
        const totalCount = this.config.agents.length;

        if (this.elements.connectionStatusDot) {
            if (connectedCount === totalCount) {
                this.elements.connectionStatusDot.className = 'status-dot connected';
            } else if (connectedCount === 0) {
                this.elements.connectionStatusDot.className = 'status-dot disconnected';
            } else {
                this.elements.connectionStatusDot.className = 'status-dot partial';
            }
        }

        if (this.elements.connectionStatusText) {
            this.elements.connectionStatusText.textContent =
                connectedCount === totalCount ? '연결됨' :
                connectedCount === 0 ? '연결 끊김' :
                `${connectedCount}/${totalCount} 연결됨`;
        }
    },

    /**
     * Create reconnect overlay element
     */
    createReconnectOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'reconnect-overlay';
        overlay.id = 'reconnect-overlay';
        overlay.setAttribute('role', 'alert');
        overlay.innerHTML = `
            <div class="spinner" aria-hidden="true"></div>
            <div class="message">재연결 중...</div>
            <button class="reconnect-button" id="manual-reconnect-btn">수동 재연결</button>
        `;

        if (this.elements.terminalContainer) {
            this.elements.terminalContainer.appendChild(overlay);
        }

        const reconnectBtn = document.getElementById('manual-reconnect-btn');
        if (reconnectBtn) {
            reconnectBtn.addEventListener('click', () => {
                const activeAgent = this.config.agents[this.state.activeTab];
                this.handleReconnect(activeAgent.id);
            });
        }
    },

    /**
     * Attempt to reconnect to an agent
     */
    attemptReconnect(agentId) {
        this.state.reconnectAttempts[agentId]++;
        const attempt = this.state.reconnectAttempts[agentId];

        console.log(`Reconnecting to ${agentId} (attempt ${attempt}/${this.config.reconnectAttempts})`);

        setTimeout(() => {
            const index = this.config.agents.findIndex(a => a.id === agentId);
            if (index === -1) return;

            const iframe = this.elements.iframes[index];
            const agent = this.config.agents[index];

            iframe.src = `/terminal/${agent.port}/`;
        }, this.config.reconnectDelay);
    },

    /**
     * Handle manual reconnection
     */
    handleReconnect(agentId) {
        this.state.reconnectAttempts[agentId] = 0;

        const overlay = document.getElementById('reconnect-overlay');
        if (overlay) {
            const message = overlay.querySelector('.message');
            if (message) {
                message.textContent = '재연결 시도 중...';
            }
        }

        console.log(`Manual reconnect initiated for: ${agentId}`);
        this.attemptReconnect(agentId);
    },

    /**
     * Show reconnect overlay
     */
    showReconnectOverlay(agentId) {
        const index = this.config.agents.findIndex(a => a.id === agentId);
        if (index !== this.state.activeTab) return;

        const overlay = document.getElementById('reconnect-overlay');
        if (overlay) {
            const message = overlay.querySelector('.message');
            if (message) {
                message.textContent = '연결 끊김 - 재연결 버튼을 클릭하세요';
            }
            overlay.classList.add('visible');
        }

        console.log(`Showing reconnect overlay for: ${agentId}`);
    },

    /**
     * Hide reconnect overlay
     */
    hideReconnectOverlay(agentId) {
        const overlay = document.getElementById('reconnect-overlay');
        if (overlay) {
            overlay.classList.remove('visible');
        }

        console.log(`Hiding reconnect overlay for: ${agentId}`);
    },

    /**
     * Announce status changes for screen readers
     */
    announceStatus(message) {
        if (this.elements.statusAnnouncer) {
            this.elements.statusAnnouncer.textContent = message;
            setTimeout(() => {
                this.elements.statusAnnouncer.textContent = '';
            }, 1000);
        }
    },

    /**
     * Set agent status manually (for testing)
     */
    setAgentStatus(agentId, status) {
        const validStatuses = ['idle', 'working', 'error'];
        if (!validStatuses.includes(status)) {
            console.warn(`Invalid status: ${status}`);
            return;
        }

        this.state.agentStatuses[agentId] = status;
        this.updateStatusIndicator(agentId);
    },

    /**
     * Get current state (for debugging)
     */
    getState() {
        return { ...this.state };
    },

    /**
     * Set up view toggle button
     */
    setupViewToggle() {
        if (this.elements.viewToggleButton) {
            this.elements.viewToggleButton.addEventListener('click', () => {
                this.toggleViewMode();
            });
        }
    },

    /**
     * Set up cover toggle button
     */
    setupCoverToggle() {
        if (this.elements.coverToggleButton) {
            this.elements.coverToggleButton.addEventListener('click', () => {
                this.toggleStatusCover();
            });
        }
    },

    /**
     * Toggle status cover on/off in split view
     */
    toggleStatusCover() {
        if (this.state.viewMode !== 'split') return;

        this.state.statusCoverEnabled = !this.state.statusCoverEnabled;

        // Update toggle button appearance
        if (this.elements.coverToggleButton) {
            this.elements.coverToggleButton.classList.toggle('active', this.state.statusCoverEnabled);
        }

        // Re-render split view grid with new mode
        this.renderSplitViewGrid();

        const message = this.state.statusCoverEnabled ? 'Status Cover 활성화됨' : 'Status Cover 비활성화됨';
        this.announceStatus(message);
        console.log(`Status Cover: ${this.state.statusCoverEnabled ? 'ON' : 'OFF'}`);
    },

    /**
     * Render only the grid area of split view (for cover toggle)
     */
    renderSplitViewGrid() {
        const gridArea = document.getElementById('split-view-grid');
        if (!gridArea) return;

        // Clear existing grid content
        gridArea.innerHTML = '';

        // Create grid items
        this.config.agents.forEach((agent, index) => {
            if (index === this.state.mainAgentIndex) return;

            const miniTerminal = document.createElement('div');
            miniTerminal.className = 'terminal-mini';
            miniTerminal.dataset.agentIndex = index;

            if (this.state.statusCoverEnabled) {
                // Status Cover mode
                const statusCover = this.createStatusCover(agent);
                miniTerminal.appendChild(statusCover);
            } else {
                // Real iframe mode
                const iframe = document.createElement('iframe');
                iframe.className = 'terminal-iframe';
                iframe.src = `/terminal/${agent.port}/`;
                iframe.title = `${agent.fullName} 터미널`;
                miniTerminal.appendChild(iframe);

                // Add mini label
                const label = document.createElement('div');
                label.className = 'terminal-mini-label';
                label.innerHTML = `<span>${agent.name}</span>`;
                miniTerminal.appendChild(label);
            }

            // Double-click to swap with main
            miniTerminal.addEventListener('dblclick', () => {
                this.swapMainTerminal(index);
            });

            gridArea.appendChild(miniTerminal);
        });
    },

    /**
     * Create split view container
     */
    createSplitViewContainer() {
        const container = document.createElement('div');
        container.className = 'split-view-container';
        container.id = 'split-view-container';

        // Main terminal area (left 50%)
        const mainArea = document.createElement('div');
        mainArea.className = 'split-view-main';
        mainArea.id = 'split-view-main';

        // Grid area (right 50%)
        const gridArea = document.createElement('div');
        gridArea.className = 'split-view-grid';
        gridArea.id = 'split-view-grid';

        container.appendChild(mainArea);
        container.appendChild(gridArea);

        // Insert after terminal-area
        if (this.elements.terminalContainer) {
            this.elements.terminalContainer.after(container);
        }

        this.elements.splitViewContainer = container;
    },

    /**
     * Toggle between tab and split view modes
     */
    toggleViewMode() {
        if (this.state.viewMode === 'tab') {
            this.enableSplitView();
        } else {
            this.enableTabView();
        }
    },

    /**
     * Enable split view mode
     */
    enableSplitView() {
        this.state.viewMode = 'split';
        this.state.mainAgentIndex = this.state.activeTab;

        // Update body class
        document.body.classList.add('split-view-mode');

        // Update view toggle button
        if (this.elements.viewToggleButton) {
            this.elements.viewToggleButton.classList.add('active');
            const tabIcon = this.elements.viewToggleButton.querySelector('.tab-view');
            const splitIcon = this.elements.viewToggleButton.querySelector('.split-view');
            if (tabIcon) tabIcon.classList.add('hidden');
            if (splitIcon) splitIcon.classList.remove('hidden');
        }

        // Update cover toggle button state
        if (this.elements.coverToggleButton) {
            this.elements.coverToggleButton.classList.toggle('active', this.state.statusCoverEnabled);
        }

        // Render split view
        this.renderSplitView();

        this.announceStatus('분할 뷰 모드 활성화됨');
        console.log('Split view enabled');
    },

    /**
     * Enable tab view mode
     */
    enableTabView() {
        this.state.viewMode = 'tab';

        // Update body class
        document.body.classList.remove('split-view-mode');

        // Update toggle button
        if (this.elements.viewToggleButton) {
            this.elements.viewToggleButton.classList.remove('active');
            const tabIcon = this.elements.viewToggleButton.querySelector('.tab-view');
            const splitIcon = this.elements.viewToggleButton.querySelector('.split-view');
            if (tabIcon) tabIcon.classList.remove('hidden');
            if (splitIcon) splitIcon.classList.add('hidden');
        }

        // Clear split view content
        this.clearSplitView();

        // Restore tab view to main agent
        this.switchTab(this.state.mainAgentIndex);

        this.announceStatus('탭 뷰 모드 활성화됨');
        console.log('Tab view enabled');
    },

    /**
     * Render split view with iframes
     */
    renderSplitView() {
        const mainArea = document.getElementById('split-view-main');

        if (!mainArea) return;

        // Clear main area
        mainArea.innerHTML = '';

        const mainAgent = this.config.agents[this.state.mainAgentIndex];

        // Create main terminal with agent index tracking
        mainArea.dataset.agentIndex = this.state.mainAgentIndex;

        // Create tmux command header (replaces old label)
        const tmuxHeader = this.createTmuxHeader(mainAgent);

        const mainIframe = document.createElement('iframe');
        mainIframe.className = 'terminal-iframe';
        mainIframe.id = `split-main-iframe`;
        mainIframe.dataset.agentIndex = this.state.mainAgentIndex;
        mainIframe.src = `/terminal/${mainAgent.port}/`;
        mainIframe.title = `${mainAgent.fullName} 터미널`;

        mainArea.appendChild(tmuxHeader);
        mainArea.appendChild(mainIframe);

        // Render grid using shared method
        this.renderSplitViewGrid();
    },

    /**
     * Create tmux command header for main terminal
     */
    createTmuxHeader(agent) {
        const header = document.createElement('div');
        header.className = 'tmux-command-header';
        header.id = 'tmux-command-header';

        const tmuxCommand = `tmux attach -t ${agent.id}`;

        header.innerHTML = `
            <div class="tmux-header-left">
                <span class="agent-name">${agent.name} - ${agent.fullName}</span>
            </div>
            <div class="tmux-header-right">
                <code class="tmux-command" title="클릭하여 복사">${tmuxCommand}</code>
                <button class="tmux-copy-btn" aria-label="명령어 복사" title="클립보드에 복사">
                    <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <svg class="copied-icon hidden" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </button>
            </div>
        `;

        // Add click handlers for copy functionality
        const commandEl = header.querySelector('.tmux-command');
        const copyBtn = header.querySelector('.tmux-copy-btn');

        const copyHandler = () => this.copyTmuxCommand(tmuxCommand, header);

        commandEl.addEventListener('click', copyHandler);
        copyBtn.addEventListener('click', copyHandler);

        // Add right-click context menu for agent control
        header.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e.clientX, e.clientY, agent.id);
        });

        return header;
    },

    /**
     * Copy tmux command to clipboard
     */
    async copyTmuxCommand(command, headerEl) {
        try {
            await navigator.clipboard.writeText(command);

            // Show success feedback
            const copyIcon = headerEl.querySelector('.copy-icon');
            const copiedIcon = headerEl.querySelector('.copied-icon');
            const commandEl = headerEl.querySelector('.tmux-command');

            copyIcon.classList.add('hidden');
            copiedIcon.classList.remove('hidden');
            commandEl.classList.add('copied');

            // Reset after 2 seconds
            setTimeout(() => {
                copyIcon.classList.remove('hidden');
                copiedIcon.classList.add('hidden');
                commandEl.classList.remove('copied');
            }, 2000);

            this.announceStatus('명령어가 클립보드에 복사되었습니다');
            console.log(`Copied to clipboard: ${command}`);
        } catch (err) {
            console.error('Failed to copy:', err);
            this.announceStatus('복사 실패');
        }
    },

    /**
     * Create Status Cover element for an agent
     */
    createStatusCover(agent) {
        const status = this.state.agentStatuses[agent.id] || 'idle';
        const runningState = this.state.runningStatuses[agent.id];
        // null: unknown, false: stopped, true: running
        const isRunning = runningState !== false;
        const statusLabel = runningState === null ? '확인 중...' :
                            runningState === false ? '종료됨' :
                            this.getStatusLabel(status);
        const stoppedClass = runningState === false ? ' stopped' : '';

        const cover = document.createElement('div');
        cover.className = `status-cover ${status}${stoppedClass}`;
        cover.dataset.agentId = agent.id;
        cover.style.backgroundImage = `url('${agent.image}')`;

        cover.innerHTML = `
            <div class="status-cover-overlay"></div>
            <div class="status-cover-content">
                <div class="status-cover-name">${agent.fullName}</div>
                <div class="status-cover-status">
                    <span class="status-cover-dot"></span>
                    <span class="status-cover-text">${statusLabel}</span>
                </div>
            </div>
            <div class="status-cover-hint">더블클릭으로 메인 전환</div>
        `;

        return cover;
    },

    /**
     * Update Status Cover for a specific agent
     */
    updateStatusCover(agentId) {
        const status = this.state.agentStatuses[agentId] || 'idle';
        const runningState = this.state.runningStatuses[agentId];
        // null: unknown, false: stopped, true: running
        const statusLabel = runningState === null ? '확인 중...' :
                            runningState === false ? '종료됨' :
                            this.getStatusLabel(status);

        const cover = document.querySelector(`.status-cover[data-agent-id="${agentId}"]`);
        if (cover) {
            cover.classList.remove('stopped');
            cover.className = `status-cover ${status}`;
            if (runningState === false) {
                cover.classList.add('stopped');
            }
            const textEl = cover.querySelector('.status-cover-text');
            if (textEl) {
                textEl.textContent = statusLabel;
            }
        }
    },

    /**
     * Swap main terminal with a grid terminal (Status Cover version)
     */
    swapMainTerminal(newMainIndex) {
        if (newMainIndex === this.state.mainAgentIndex) return;

        const mainArea = document.getElementById('split-view-main');
        const gridArea = document.getElementById('split-view-grid');
        if (!mainArea || !gridArea) return;

        const oldMainIndex = this.state.mainAgentIndex;
        const oldMainAgent = this.config.agents[oldMainIndex];
        const newMainAgent = this.config.agents[newMainIndex];

        // Find the grid terminal to swap
        const gridTerminal = gridArea.querySelector(`.terminal-mini[data-agent-index="${newMainIndex}"]`);
        if (!gridTerminal) return;

        // Store grid terminal position for insertion
        const gridTerminalNextSibling = gridTerminal.nextSibling;

        // 1. Create new grid terminal for old main agent (with Status Cover)
        const newGridTerminal = document.createElement('div');
        newGridTerminal.className = 'terminal-mini';
        newGridTerminal.dataset.agentIndex = oldMainIndex;

        const statusCover = this.createStatusCover(oldMainAgent);
        newGridTerminal.appendChild(statusCover);

        newGridTerminal.addEventListener('dblclick', () => {
            this.swapMainTerminal(oldMainIndex);
        });

        // 2. Update main area with new agent's terminal
        mainArea.dataset.agentIndex = newMainIndex;

        // Create new tmux command header
        const newTmuxHeader = this.createTmuxHeader(newMainAgent);

        const newMainIframe = document.createElement('iframe');
        newMainIframe.className = 'terminal-iframe';
        newMainIframe.id = 'split-main-iframe';
        newMainIframe.dataset.agentIndex = newMainIndex;
        newMainIframe.src = `/terminal/${newMainAgent.port}/`;
        newMainIframe.title = `${newMainAgent.fullName} 터미널`;

        mainArea.innerHTML = '';
        mainArea.appendChild(newTmuxHeader);
        mainArea.appendChild(newMainIframe);

        // 3. Replace old grid terminal with new one
        gridArea.removeChild(gridTerminal);
        if (gridTerminalNextSibling) {
            gridArea.insertBefore(newGridTerminal, gridTerminalNextSibling);
        } else {
            gridArea.appendChild(newGridTerminal);
        }

        // Update state
        this.state.mainAgentIndex = newMainIndex;

        this.announceStatus(`${newMainAgent.fullName}이(가) 메인 터미널로 전환됨`);
        console.log(`Swapped main terminal: ${oldMainAgent.id} -> ${newMainAgent.id}`);
    },

    /**
     * Set up context menu
     */
    setupContextMenu() {
        // Right-click handler on terminal-mini and status-cover
        document.addEventListener('contextmenu', (e) => {
            const statusCover = e.target.closest('.status-cover');
            const terminalMini = e.target.closest('.terminal-mini');

            if (statusCover || terminalMini) {
                e.preventDefault();
                const agentId = statusCover ? statusCover.dataset.agentId :
                    terminalMini ? this.config.agents[parseInt(terminalMini.dataset.agentIndex)]?.id : null;

                if (agentId) {
                    this.showContextMenu(e.clientX, e.clientY, agentId);
                }
            }
        });

        // Close context menu on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.context-menu')) {
                this.hideContextMenu();
            }
        });

        // Context menu item handlers
        if (this.elements.contextMenuToggle) {
            this.elements.contextMenuToggle.addEventListener('click', () => {
                this.toggleAgentRunning();
            });
        }

        if (this.elements.contextMenuInfo) {
            this.elements.contextMenuInfo.addEventListener('click', () => {
                this.showAgentInfoModal();
            });
        }

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elements.contextMenu?.classList.contains('visible')) {
                this.hideContextMenu();
            }
        });
    },

    /**
     * Show context menu at position
     */
    async showContextMenu(x, y, agentId) {
        this.state.contextMenuAgentId = agentId;
        const menu = this.elements.contextMenu;
        if (!menu) return;

        // Check running state
        try {
            const response = await fetch(`/api/agent/${agentId}/running`);
            const data = await response.json();
            const isRunning = data.running;

            if (this.elements.contextMenuToggleText) {
                this.elements.contextMenuToggleText.textContent = isRunning ? '종료' : '실행';
            }
        } catch (err) {
            console.error('Failed to check agent running state:', err);
        }

        // Position menu
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        menu.classList.add('visible');

        // Adjust if menu goes off screen
        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            menu.style.left = `${x - rect.width}px`;
        }
        if (rect.bottom > window.innerHeight) {
            menu.style.top = `${y - rect.height}px`;
        }
    },

    /**
     * Hide context menu
     */
    hideContextMenu() {
        if (this.elements.contextMenu) {
            this.elements.contextMenu.classList.remove('visible');
        }
        this.state.contextMenuAgentId = null;
    },

    /**
     * Toggle agent running state (start/stop)
     */
    async toggleAgentRunning() {
        const agentId = this.state.contextMenuAgentId;
        if (!agentId) return;

        this.hideContextMenu();

        try {
            // Check actual state via API (not cached value)
            const checkResponse = await fetch(`/api/agent/${agentId}/running`);
            const checkData = await checkResponse.json();
            const isRunning = checkData.running;

            // Toggle
            const action = isRunning ? 'stop' : 'start';
            const response = await fetch(`/api/agent/${agentId}/${action}`, { method: 'POST' });
            const data = await response.json();

            if (data.error) {
                this.announceStatus(`에이전트 ${action === 'start' ? '시작' : '종료'} 실패`);
                console.error(`Failed to ${action} agent:`, data.error);
            } else {
                // Update runningStatuses immediately
                this.state.runningStatuses[agentId] = !isRunning;
                this.updateStatusCover(agentId);
                this.announceStatus(`에이전트가 ${action === 'start' ? '시작' : '종료'}되었습니다`);
                console.log(`Agent ${agentId} ${action}ed`);
            }
        } catch (err) {
            console.error('Failed to toggle agent:', err);
            this.announceStatus('에이전트 제어 실패');
        }
    },

    /**
     * Set up agent info modal
     */
    setupAgentInfoModal() {
        if (this.elements.agentInfoModalClose) {
            this.elements.agentInfoModalClose.addEventListener('click', () => {
                this.closeAgentInfoModal();
            });
        }

        if (this.elements.agentInfoModal) {
            this.elements.agentInfoModal.addEventListener('click', (e) => {
                if (e.target === this.elements.agentInfoModal) {
                    this.closeAgentInfoModal();
                }
            });
        }
    },

    /**
     * Show agent info modal
     */
    async showAgentInfoModal() {
        const agentId = this.state.contextMenuAgentId;
        if (!agentId) return;

        this.hideContextMenu();

        const agent = this.config.agents.find(a => a.id === agentId);
        if (!agent) return;

        // Set role summary
        if (this.elements.agentRoleSummary) {
            this.elements.agentRoleSummary.textContent = this.config.agentRoles[agentId] || '';
        }

        // Set modal title
        const modalTitle = document.getElementById('agent-info-modal-title');
        if (modalTitle) {
            modalTitle.textContent = `${agent.fullName} 정보`;
        }

        // Fetch CLAUDE.md content
        if (this.elements.agentClaudeMdContent) {
            this.elements.agentClaudeMdContent.textContent = '로딩 중...';
            try {
                const response = await fetch(`/api/agent/${agentId}/info`);
                const data = await response.json();
                this.elements.agentClaudeMdContent.textContent = data.content || 'No content';
            } catch (err) {
                this.elements.agentClaudeMdContent.textContent = '내용을 불러올 수 없습니다.';
                console.error('Failed to fetch agent info:', err);
            }
        }

        // Show modal
        if (this.elements.agentInfoModal) {
            this.elements.agentInfoModal.classList.add('visible');
            this.state.isAgentInfoModalOpen = true;
            document.body.style.overflow = 'hidden';
        }
    },

    /**
     * Close agent info modal
     */
    closeAgentInfoModal() {
        if (this.elements.agentInfoModal) {
            this.elements.agentInfoModal.classList.remove('visible');
            this.state.isAgentInfoModalOpen = false;
            document.body.style.overflow = '';
        }
    },

    /**
     * Set up shutdown modal
     */
    setupShutdownModal() {
        // Shutdown button click
        if (this.elements.shutdownButton) {
            this.elements.shutdownButton.addEventListener('click', () => {
                this.openShutdownModal();
            });
        }

        // Close button click
        if (this.elements.shutdownModalClose) {
            this.elements.shutdownModalClose.addEventListener('click', () => {
                this.closeShutdownModal();
            });
        }

        // Cancel button click
        if (this.elements.cancelShutdownBtn) {
            this.elements.cancelShutdownBtn.addEventListener('click', () => {
                this.closeShutdownModal();
            });
        }

        // Click outside modal to close
        if (this.elements.shutdownModal) {
            this.elements.shutdownModal.addEventListener('click', (e) => {
                if (e.target === this.elements.shutdownModal) {
                    this.closeShutdownModal();
                }
            });
        }

        // Prep shutdown button
        if (this.elements.prepShutdownBtn) {
            this.elements.prepShutdownBtn.addEventListener('click', () => {
                this.handlePrepShutdown();
            });
        }

        // Full shutdown button
        if (this.elements.fullShutdownBtn) {
            this.elements.fullShutdownBtn.addEventListener('click', () => {
                this.handleFullShutdown();
            });
        }

        // Restart all button
        if (this.elements.restartAllBtn) {
            this.elements.restartAllBtn.addEventListener('click', () => {
                this.handleRestartAll();
            });
        }
    },

    /**
     * Open shutdown modal
     */
    openShutdownModal() {
        if (this.elements.shutdownModal) {
            this.elements.shutdownModal.classList.add('visible');
            this.state.isShutdownModalOpen = true;
            document.body.style.overflow = 'hidden';

            // Reset button states
            this.resetShutdownButtons();

            // Focus the first button
            if (this.elements.prepShutdownBtn) {
                this.elements.prepShutdownBtn.focus();
            }
        }
    },

    /**
     * Close shutdown modal
     */
    closeShutdownModal() {
        if (this.elements.shutdownModal) {
            this.elements.shutdownModal.classList.remove('visible');
            this.state.isShutdownModalOpen = false;
            document.body.style.overflow = '';
        }
    },

    /**
     * Reset shutdown button states
     */
    resetShutdownButtons() {
        const buttons = [this.elements.prepShutdownBtn, this.elements.fullShutdownBtn, this.elements.restartAllBtn];
        buttons.forEach(btn => {
            if (btn) {
                btn.classList.remove('loading', 'success');
            }
        });
    },

    /**
     * Handle prep stage agents shutdown
     */
    async handlePrepShutdown() {
        const btn = this.elements.prepShutdownBtn;
        if (!btn) return;

        btn.classList.add('loading');

        try {
            const response = await fetch('/api/shutdown/prep', { method: 'POST' });
            const data = await response.json();

            if (data.success) {
                btn.classList.remove('loading');
                btn.classList.add('success');

                // Update status display
                this.announceStatus('준비 단계 에이전트가 종료되었습니다');

                // Force poll to update status covers
                setTimeout(() => {
                    this.pollStatus();
                }, 1000);

                // Close modal after short delay
                setTimeout(() => {
                    this.closeShutdownModal();
                }, 1500);
            } else {
                throw new Error(data.error || 'Unknown error');
            }
        } catch (err) {
            console.error('Prep shutdown failed:', err);
            btn.classList.remove('loading');
            this.announceStatus('준비 단계 에이전트 종료 실패');
        }
    },

    /**
     * Handle full system shutdown
     */
    async handleFullShutdown() {
        const btn = this.elements.fullShutdownBtn;
        if (!btn) return;

        // Confirm before full shutdown
        if (!confirm('전체 시스템을 종료하시겠습니까?\n모든 에이전트와 대시보드가 종료됩니다.')) {
            return;
        }

        btn.classList.add('loading');

        try {
            const response = await fetch('/api/shutdown/all', { method: 'POST' });
            const data = await response.json();

            if (data.success) {
                btn.classList.remove('loading');
                btn.classList.add('success');

                this.announceStatus('전체 시스템 종료가 시작되었습니다');

                // Show shutdown message
                const modal = this.elements.shutdownModal;
                if (modal) {
                    const body = modal.querySelector('.modal-body');
                    if (body) {
                        body.innerHTML = `
                            <div style="text-align: center; padding: 40px 20px;">
                                <div style="font-size: 48px; margin-bottom: 16px;">👋</div>
                                <p style="font-size: 16px; color: var(--text-primary);">시스템이 종료됩니다...</p>
                                <p style="font-size: 14px; color: var(--text-secondary); margin-top: 8px;">브라우저 탭을 닫아주세요.</p>
                            </div>
                        `;
                    }
                }
            } else {
                throw new Error(data.error || 'Unknown error');
            }
        } catch (err) {
            console.error('Full shutdown failed:', err);
            btn.classList.remove('loading');
            this.announceStatus('전체 시스템 종료 실패');
        }
    },

    /**
     * Handle restart all agents
     */
    async handleRestartAll() {
        const btn = this.elements.restartAllBtn;
        if (!btn) return;

        // Confirm before restart
        if (!confirm('모든 에이전트를 재시작하시겠습니까?\n진행 중인 작업이 있다면 중단될 수 있습니다.')) {
            return;
        }

        btn.classList.add('loading');

        try {
            const response = await fetch('/api/restart/all', { method: 'POST' });
            const data = await response.json();

            if (data.success) {
                btn.classList.remove('loading');
                btn.classList.add('success');

                this.announceStatus('전체 에이전트 재시작이 시작되었습니다');

                // Show restart message
                const modal = this.elements.shutdownModal;
                if (modal) {
                    const body = modal.querySelector('.modal-body');
                    if (body) {
                        body.innerHTML = `
                            <div style="text-align: center; padding: 40px 20px;">
                                <div style="font-size: 48px; margin-bottom: 16px;">🔄</div>
                                <p style="font-size: 16px; color: var(--text-primary);">에이전트를 재시작하고 있습니다...</p>
                                <p style="font-size: 14px; color: var(--text-secondary); margin-top: 8px;">잠시만 기다려주세요.</p>
                            </div>
                        `;
                    }
                }

                // Close modal and refresh iframes after delay
                setTimeout(() => {
                    this.closeShutdownModal();

                    // Reset modal body for next open
                    const modalBody = this.elements.shutdownModal?.querySelector('.modal-body');
                    if (modalBody) {
                        location.reload(); // Reload page to refresh all iframes
                    }
                }, 5000);
            } else {
                throw new Error(data.error || 'Unknown error');
            }
        } catch (err) {
            console.error('Restart all failed:', err);
            btn.classList.remove('loading');
            this.announceStatus('전체 에이전트 재시작 실패');
        }
    },

    /**
     * Clear split view content
     */
    clearSplitView() {
        const mainArea = document.getElementById('split-view-main');
        const gridArea = document.getElementById('split-view-grid');

        if (mainArea) mainArea.innerHTML = '';
        if (gridArea) gridArea.innerHTML = '';
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    AgentDashboard.init();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AgentDashboard;
}

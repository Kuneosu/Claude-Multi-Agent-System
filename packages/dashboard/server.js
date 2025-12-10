/**
 * Multi-Agent Dashboard Proxy Server
 *
 * Same-origin 프록시로 cross-origin 문제 해결
 * - / : 정적 파일 서빙 (index.html, css, js)
 * - /terminal/:port : ttyd 프록시 (WebSocket 포함)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const httpProxy = require('http-proxy');
const { exec } = require('child_process');

const PORT = process.env.PORT || 8080;
const STATIC_DIR = __dirname;

// 동적 경로 설정: 환경변수 또는 상대경로 사용
const ROOT_DIR = process.env.MAS_ROOT || path.resolve(__dirname, '../..');
const WORKSPACE_DIR = path.join(ROOT_DIR, 'workspace');
const STATUS_DIR = path.join(WORKSPACE_DIR, 'status');
const AGENTS_DIR = path.join(WORKSPACE_DIR, 'agents');

// 에이전트 목록
const AGENTS = [
    'orchestrator', 'requirement-analyst', 'ux-designer', 'tech-architect',
    'planner', 'test-designer', 'developer', 'reviewer', 'documenter'
];

// 준비 단계 에이전트 목록
const PREP_AGENTS = [
    'requirement-analyst', 'ux-designer', 'tech-architect', 'planner', 'test-designer'
];

// MIME 타입 매핑
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// 프록시 서버 생성
const proxy = httpProxy.createProxyServer({
    ws: true,
    changeOrigin: true
});

// 프록시 에러 핸들링
proxy.on('error', (err, req, res) => {
    console.error('Proxy error:', err.message);
    if (res.writeHead) {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('Proxy error: ' + err.message);
    }
});

/**
 * 에이전트 상태 파일 읽기
 */
function readAgentStatus(agentId) {
    const statusFile = path.join(STATUS_DIR, `${agentId}.status`);
    try {
        if (fs.existsSync(statusFile)) {
            const content = fs.readFileSync(statusFile, 'utf8').trim();
            return content || 'idle';
        }
    } catch (err) {
        console.error(`Error reading status for ${agentId}:`, err.message);
    }
    return 'idle';
}

/**
 * JSON 응답 헬퍼
 */
function sendJSON(res, data, statusCode = 200) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(data));
}

// HTTP 서버 생성
const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = url.pathname;

    // GET /api/status - 모든 에이전트 상태
    if (pathname === '/api/status' && req.method === 'GET') {
        const statuses = {};
        AGENTS.forEach(agentId => {
            statuses[agentId] = {
                id: agentId,
                status: readAgentStatus(agentId)
            };
        });
        sendJSON(res, { agents: statuses });
        return;
    }

    // GET /api/agents/status - 배치 API (status + running 통합)
    if (pathname === '/api/agents/status' && req.method === 'GET') {
        const result = {};
        let pending = AGENTS.length;

        AGENTS.forEach(agentId => {
            const status = readAgentStatus(agentId);
            exec(`tmux has-session -t ${agentId} 2>/dev/null && echo "running" || echo "stopped"`, (err, stdout) => {
                const isRunning = stdout.trim() === 'running';
                result[agentId] = { status, running: isRunning };
                pending--;
                if (pending === 0) {
                    sendJSON(res, result);
                }
            });
        });
        return;
    }

    // GET /api/status/:agentId - 개별 에이전트 상태
    const statusMatch = pathname.match(/^\/api\/status\/([a-z-]+)$/);
    if (statusMatch && req.method === 'GET') {
        const agentId = statusMatch[1];
        if (!AGENTS.includes(agentId)) {
            sendJSON(res, { error: 'Agent not found' }, 404);
            return;
        }
        const status = readAgentStatus(agentId);
        sendJSON(res, { id: agentId, status });
        return;
    }

    // GET /api/agent/:agentId/running - tmux 세션 실행 상태 확인
    const runningMatch = pathname.match(/^\/api\/agent\/([a-z-]+)\/running$/);
    if (runningMatch && req.method === 'GET') {
        const agentId = runningMatch[1];
        if (!AGENTS.includes(agentId)) {
            sendJSON(res, { error: 'Agent not found' }, 404);
            return;
        }
        exec(`tmux has-session -t ${agentId} 2>/dev/null && echo "running" || echo "stopped"`, (err, stdout) => {
            const isRunning = stdout.trim() === 'running';
            sendJSON(res, { id: agentId, running: isRunning });
        });
        return;
    }

    // POST /api/agent/:agentId/start - 에이전트 시작
    const startMatch = pathname.match(/^\/api\/agent\/([a-z-]+)\/start$/);
    if (startMatch && req.method === 'POST') {
        const agentId = startMatch[1];
        if (!AGENTS.includes(agentId)) {
            sendJSON(res, { error: 'Agent not found' }, 404);
            return;
        }
        const agentDir = path.join(AGENTS_DIR, agentId);
        // 자동화 모드: --dangerously-skip-permissions 옵션 사용
        const claudeCmd = `claude --dangerously-skip-permissions --model opus --append-system-prompt "\\$(cat CLAUDE.md)"`;
        const cmd = `tmux new-session -d -s ${agentId} -c "${agentDir}" && sleep 0.2 && tmux send-keys -t ${agentId}:0 '${claudeCmd}' && sleep 0.2 && tmux send-keys -t ${agentId}:0 C-m`;
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                sendJSON(res, { error: 'Failed to start agent', details: stderr }, 500);
            } else {
                sendJSON(res, { id: agentId, started: true });
            }
        });
        return;
    }

    // POST /api/agent/:agentId/stop - 에이전트 종료
    const stopMatch = pathname.match(/^\/api\/agent\/([a-z-]+)\/stop$/);
    if (stopMatch && req.method === 'POST') {
        const agentId = stopMatch[1];
        if (!AGENTS.includes(agentId)) {
            sendJSON(res, { error: 'Agent not found' }, 404);
            return;
        }
        exec(`tmux kill-session -t ${agentId}`, (err, stdout, stderr) => {
            if (err) {
                sendJSON(res, { error: 'Failed to stop agent', details: stderr }, 500);
            } else {
                sendJSON(res, { id: agentId, stopped: true });
            }
        });
        return;
    }

    // GET /api/agent/:agentId/info - CLAUDE.md 내용 반환
    const infoMatch = pathname.match(/^\/api\/agent\/([a-z-]+)\/info$/);
    if (infoMatch && req.method === 'GET') {
        const agentId = infoMatch[1];
        if (!AGENTS.includes(agentId)) {
            sendJSON(res, { error: 'Agent not found' }, 404);
            return;
        }
        const claudeMdPath = path.join(AGENTS_DIR, agentId, 'CLAUDE.md');
        fs.readFile(claudeMdPath, 'utf8', (err, content) => {
            if (err) {
                sendJSON(res, { id: agentId, content: '# CLAUDE.md not found\n\nNo documentation available.' });
            } else {
                sendJSON(res, { id: agentId, content });
            }
        });
        return;
    }

    // POST /api/shutdown/prep - 준비 단계 에이전트 일괄 종료
    if (pathname === '/api/shutdown/prep' && req.method === 'POST') {
        const results = {};
        let pending = PREP_AGENTS.length;

        PREP_AGENTS.forEach(agentId => {
            exec(`tmux kill-session -t ${agentId} 2>/dev/null`, (err, stdout, stderr) => {
                results[agentId] = err ? { stopped: false, error: stderr } : { stopped: true };
                pending--;
                if (pending === 0) {
                    sendJSON(res, {
                        success: true,
                        message: '준비 단계 에이전트가 종료되었습니다.',
                        agents: results
                    });
                }
            });
        });
        return;
    }

    // POST /api/restart/all - 전체 에이전트 재시작
    if (pathname === '/api/restart/all' && req.method === 'POST') {
        console.log('[Restart] Starting full agent restart...');

        // 1. Kill all agent sessions
        let agentsStopped = 0;
        const totalAgents = AGENTS.length;

        AGENTS.forEach(agentId => {
            exec(`tmux kill-session -t ${agentId} 2>/dev/null`, (err) => {
                agentsStopped++;
                if (!err) {
                    console.log(`[Restart] Killed session: ${agentId}`);
                }

                // All agents stopped, start restart process
                if (agentsStopped === totalAgents) {
                    console.log('[Restart] All sessions killed. Waiting 2 seconds before restart...');

                    setTimeout(() => {
                        console.log('[Restart] Creating all agent sessions...');
                        let sessionsCreated = 0;

                        // Step 1: Create all tmux sessions with proper status bar
                        AGENTS.forEach(agentId => {
                            const agentDir = path.join(AGENTS_DIR, agentId);
                            const sessionCmd = `tmux new-session -d -s ${agentId} -c "${agentDir}" && ` +
                                `tmux set-option -t ${agentId} status on && ` +
                                `tmux set-option -t ${agentId} status-style "bg=red,fg=white" && ` +
                                `tmux set-option -t ${agentId} status-left "[${agentId}] (Auto) " && ` +
                                `tmux set-option -t ${agentId} status-left-length 30 && ` +
                                `tmux set-option -t ${agentId} status-right " Ctrl+b,d:메뉴로 돌아가기 " && ` +
                                `tmux set-option -t ${agentId} status-right-length 30`;

                            exec(sessionCmd, (err) => {
                                sessionsCreated++;
                                if (!err) {
                                    console.log(`[Restart] Session created: ${agentId}`);
                                } else {
                                    console.error(`[Restart] Failed to create session ${agentId}:`, err.message);
                                }

                                // All sessions created, start claude
                                if (sessionsCreated === totalAgents) {
                                    console.log('[Restart] All sessions created. Starting Claude instances...');

                                    setTimeout(() => {
                                        let claudeStarted = 0;

                                        // Step 2: Start claude in each session
                                        AGENTS.forEach(agentId => {
                                            // Note: In production, model should come from config
                                            // For now using opus as default (matching config.sh defaults)
                                            const claudeCmd = `claude --dangerously-skip-permissions --model opus --append-system-prompt "\\$(cat CLAUDE.md)"`;
                                            const startCmd = `tmux send-keys -t ${agentId}:0 '${claudeCmd}' Enter`;

                                            exec(startCmd, (err) => {
                                                claudeStarted++;
                                                if (!err) {
                                                    console.log(`[Restart] Claude started: ${agentId}`);
                                                }

                                                // All claude instances started, wait and send init messages
                                                if (claudeStarted === totalAgents) {
                                                    console.log('[Restart] All Claude instances started. Waiting 8 seconds for initialization...');

                                                    // Step 3: Wait for Claude to fully initialize, then send init messages
                                                    setTimeout(() => {
                                                        console.log('[Restart] Sending initialization messages to all agents...');

                                                        // Orchestrator message
                                                        const orchestratorMsg = '시스템 초기화 완료. 당신은 오케스트레이터입니다. CLAUDE.md에 정의된 역할과 규칙을 반드시 준수하세요. 사용자의 프로젝트 요청을 받으면 절대 직접 코드를 작성하지 말고, 전문 에이전트들에게 tmux를 통해 작업을 위임하세요.';
                                                        exec(`tmux send-keys -t orchestrator:0 "${orchestratorMsg}" Enter`, (err) => {
                                                            if (!err) {
                                                                console.log('[Restart] Sent init message to orchestrator');
                                                            }
                                                        });

                                                        // Other agents message
                                                        const agentMsg = '시스템 초기화 완료. CLAUDE.md에 정의된 역할과 규칙을 반드시 준수하세요. 작업 완료 시 반드시 시그널 파일을 생성하고 상태를 업데이트하세요.';
                                                        let msgsSent = 0;

                                                        AGENTS.forEach(agentId => {
                                                            if (agentId !== 'orchestrator') {
                                                                setTimeout(() => {
                                                                    exec(`tmux send-keys -t ${agentId}:0 "${agentMsg}" Enter`, (err) => {
                                                                        msgsSent++;
                                                                        if (!err) {
                                                                            console.log(`[Restart] Sent init message to ${agentId}`);
                                                                        }
                                                                        if (msgsSent === totalAgents - 1) {
                                                                            console.log('[Restart] All initialization messages sent successfully');
                                                                        }
                                                                    });
                                                                }, msgsSent * 500); // Stagger messages by 500ms
                                                            }
                                                        });
                                                    }, 8000); // Wait 8 seconds for Claude to initialize
                                                }
                                            });
                                        });
                                    }, 500); // Small delay after session creation
                                }
                            });
                        });
                    }, 2000); // Wait 2 seconds after killing sessions
                }
            });
        });

        sendJSON(res, {
            success: true,
            message: '전체 에이전트 재시작이 시작되었습니다.'
        });
        return;
    }

    // POST /api/shutdown/all - 전체 시스템 종료
    if (pathname === '/api/shutdown/all' && req.method === 'POST') {
        // 즉시 응답
        sendJSON(res, {
            success: true,
            message: '전체 시스템 종료가 시작되었습니다.'
        });

        // 1. 먼저 모든 에이전트 tmux 세션 종료
        console.log('[Shutdown] Starting graceful shutdown...');
        console.log('[Shutdown] Step 1: Killing all agent tmux sessions...');

        let agentsStopped = 0;
        const totalAgents = AGENTS.length;

        AGENTS.forEach(agentId => {
            exec(`tmux kill-session -t ${agentId} 2>/dev/null`, (err) => {
                agentsStopped++;
                if (!err) {
                    console.log(`[Shutdown] Killed tmux session: ${agentId}`);
                }

                // 모든 에이전트가 처리되면 다음 단계로
                if (agentsStopped === totalAgents) {
                    console.log('[Shutdown] Step 2: All agent sessions terminated. Waiting 2 seconds...');

                    // 2. 잠시 대기 후 ttyd 및 서버 종료
                    setTimeout(() => {
                        console.log('[Shutdown] Step 3: Killing ttyd processes...');

                        // ttyd 프로세스 종료
                        exec('pkill -f "ttyd.*768[1-9]" 2>/dev/null', () => {
                            console.log('[Shutdown] Step 4: Stopping dashboard server...');

                            // 서버 종료
                            setTimeout(() => {
                                console.log('[Shutdown] Goodbye!');
                                process.exit(0);
                            }, 500);
                        });
                    }, 2000);
                }
            });
        });
        return;
    }

    // /terminal/:port 프록시
    const terminalMatch = pathname.match(/^\/terminal\/(\d+)(\/.*)?$/);
    if (terminalMatch) {
        const targetPort = terminalMatch[1];
        const targetPath = terminalMatch[2] || '/';

        // 프록시 요청 경로 재작성
        req.url = targetPath + url.search;

        proxy.web(req, res, {
            target: `http://localhost:${targetPort}`
        });
        return;
    }

    // 정적 파일 서빙
    let filePath = pathname === '/' ? '/index.html' : pathname;
    filePath = path.join(STATIC_DIR, filePath);

    // 경로 순회 공격 방지
    if (!filePath.startsWith(STATIC_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404);
            res.end('Not Found');
            return;
        }

        const ext = path.extname(filePath);
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
    });
});

// WebSocket 업그레이드 핸들링
server.on('upgrade', (req, socket, head) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = url.pathname;

    const terminalMatch = pathname.match(/^\/terminal\/(\d+)(\/.*)?$/);
    if (terminalMatch) {
        const targetPort = terminalMatch[1];
        const targetPath = terminalMatch[2] || '/';

        req.url = targetPath;

        proxy.ws(req, socket, head, {
            target: `http://localhost:${targetPort}`
        });
    } else {
        socket.destroy();
    }
});

server.listen(PORT, () => {
    console.log('');
    console.log('========================================');
    console.log('  Multi-Agent Dashboard Proxy Server');
    console.log('========================================');
    console.log('');
    console.log(`Dashboard: http://localhost:${PORT}`);
    console.log('');
    console.log('Terminal proxies:');
    for (let port = 7681; port <= 7689; port++) {
        console.log(`  /terminal/${port} -> localhost:${port}`);
    }
    console.log('');
});

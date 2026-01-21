<p align="center">
  <h1 align="center">Multi-Agent System (MAS)</h1>
</p>
<p align="center">AI agents collaborating to automate software development.</p>
<p align="center">
  <a href="https://github.com/Kuneosu/Claude-Multi-Agent-System/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/Kuneosu/Claude-Multi-Agent-System?style=flat-square" /></a>
  <a href="https://github.com/Kuneosu/Claude-Multi-Agent-System/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/github/license/Kuneosu/Claude-Multi-Agent-System?style=flat-square" /></a>
  <a href="https://github.com/Kuneosu/Claude-Multi-Agent-System/issues"><img alt="Issues" src="https://img.shields.io/github/issues/Kuneosu/Claude-Multi-Agent-System?style=flat-square" /></a>
</p>
<p align="center">
  <a href="./README.ko.md">한국어</a>
</p>

<img width="2032" alt="MAS Dashboard" src="https://github.com/user-attachments/assets/cbc73a73-597b-4fe8-8a01-cab8cd0d357b" />

---

### Quick Start

```bash
# Clone repository
git clone https://github.com/Kuneosu/Claude-Multi-Agent-System.git
cd Claude-Multi-Agent-System

# Setup (check dependencies)
./setup.sh

# Run
./run.sh
```

> [!TIP]
> Make sure you have Claude CLI installed: `npm install -g @anthropic-ai/claude-code`

### Requirements

| Dependency | Version | Required |
|------------|---------|----------|
| Node.js | >= 14.0.0 | Yes |
| tmux | latest | Yes |
| Claude CLI | latest | Yes |
| ttyd | latest | Optional (for dashboard) |

### Agents

MAS consists of **9 specialized AI agents** working together:

```
orchestrator (Central Control)
    ├─> requirement-analyst  (Requirements Analysis)
    ├─> ux-designer         (UX Design)
    ├─> tech-architect      (Technical Architecture)
    ├─> planner            (Implementation Planning)
    ├─> test-designer      (Test Design - TDD)
    ├─> developer          (Code Implementation)
    ├─> reviewer           (Code Review)
    └─> documenter         (Documentation)
```

Each agent has its own role and communicates through file-based IPC signals.

### Run Modes

| Mode | Menu | Description |
|------|------|-------------|
| Terminal | 1) Terminal | Manual approval for each action |
| Terminal (Auto) | 2) Terminal (Auto) | Fully automated, no confirmations |
| Dashboard | 3) Web Dashboard | Web-based monitoring UI |
| Dashboard (Auto) | 4) Web Dashboard (Auto) | Web UI + fully automated |

### Features

- **Multi-Agent Collaboration**: 9 agents work together through orchestrated workflow
- **TDD Approach**: Test Designer → Developer → Reviewer pipeline
- **Web Dashboard**: Monitor all agents in real-time at `http://localhost:8080`
- **Configurable Models**: Set Claude model (opus/sonnet/haiku) per agent
- **File-based IPC**: Reliable inter-agent communication via signals

### Documentation

For detailed documentation, check out:

- [Quick Start Guide](docs/QUICKSTART.md)
- [User Guide](docs/GUIDE.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [System Architecture](docs/SYSTEM_ARCHITECTURE.md)

### Security Notice

> [!WARNING]
> **Auto mode** uses `--dangerously-skip-permissions` flag. In this mode:
> - Agents can create/modify/delete files without confirmation
> - System commands execute automatically
> - Use only in trusted environments

Normal mode (options 1, 3) requires user approval for all actions.

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### FAQ

#### How does MAS differ from a single AI assistant?

MAS uses specialized agents for each development phase. Instead of one AI trying to do everything, each agent focuses on its domain:
- Better quality through specialization
- Parallel processing capability
- Built-in code review and testing phases

#### What models are supported?

MAS is built on **Claude CLI** and supports:
- Claude Opus (recommended for orchestrator, developer)
- Claude Sonnet (balanced performance)
- Claude Haiku (fast, cost-effective)

#### Can I customize the agents?

Yes! Each agent's behavior is defined in `workspace/agents/[agent-name]/CLAUDE.md`. You can modify these prompts to customize agent behavior.

#### How much does it cost?

We recommend using **Claude Max ($100/month) or higher** subscription plan. While costs vary by project complexity, the unlimited API access in Max plan provides the best experience.

> [!NOTE]
> Sonnet and Haiku models may occasionally fail to follow instructions properly. For reliable results, we recommend using **Opus for all agents**.

---

**License**: [MIT](LICENSE)

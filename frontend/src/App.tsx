import React, { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Settings,
  Search,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Server,
  Layers,
  Sparkles,
  TrendingUp,
  Activity
} from 'lucide-react'

interface Project {
  id: string
  name: string
  category: string
  owner: string
  progress: number
  status: 'Active' | 'In Progress' | 'Pending' | 'Completed'
  deadline: string
}

interface TaskItem {
  id: string
  title: string
  completed: boolean
  tag: string
  priority: 'High' | 'Medium' | 'Low'
}

export function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'tasks' | 'team' | 'settings'>('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'In Progress' | 'Completed'>('all')
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [newTaskInput, setNewTaskInput] = useState('')

  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'PRJ-101',
      name: 'Cloud Infrastructure Migration',
      category: 'DevOps & Cloud',
      owner: 'Alex Vance',
      progress: 75,
      status: 'In Progress',
      deadline: 'Oct 28, 2026',
    },
    {
      id: 'PRJ-102',
      name: 'Management API Gateway',
      category: 'ASP.NET Core 8.0',
      owner: 'Sarah Connor',
      progress: 92,
      status: 'Active',
      deadline: 'Oct 22, 2026',
    },
    {
      id: 'PRJ-103',
      name: 'Client Portal React Refresh',
      category: 'Frontend UI',
      owner: 'David Kim',
      progress: 40,
      status: 'In Progress',
      deadline: 'Nov 04, 2026',
    },
    {
      id: 'PRJ-104',
      name: 'Auth0 / JWT Security Audit',
      category: 'Security',
      owner: 'Elena Rostova',
      progress: 100,
      status: 'Completed',
      deadline: 'Oct 15, 2026',
    },
    {
      id: 'PRJ-105',
      name: 'Real-time WebSocket Service',
      category: 'Microservices',
      owner: 'Michael Scott',
      progress: 15,
      status: 'Pending',
      deadline: 'Nov 18, 2026',
    },
  ])

  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: '1', title: 'Configure ASP.NET CORS policy for Vite localhost:3000', completed: true, tag: 'Backend', priority: 'High' },
    { id: '2', title: 'Setup Entity Framework database context & migrations', completed: false, tag: 'Database', priority: 'High' },
    { id: '3', title: 'Implement React Query hooks for Project management', completed: false, tag: 'Frontend', priority: 'Medium' },
    { id: '4', title: 'Prepare production Dockerfile & deployment pipeline', completed: false, tag: 'DevOps', priority: 'Low' },
  ])

  // Check ASP.NET backend status
  useEffect(() => {
    let isMounted = true
    const checkBackend = async () => {
      try {
        const response = await fetch('/api/health', { method: 'GET', signal: AbortSignal.timeout(1500) })
        if (isMounted) {
          setBackendStatus(response.ok ? 'online' : 'online')
        }
      } catch {
        if (isMounted) {
          // If not running directly, we still display the endpoint info
          setBackendStatus('offline')
        }
      }
    }

    checkBackend()
    const timer = setInterval(checkBackend, 10000)
    return () => {
      isMounted = false
      clearInterval(timer)
    }
  }, [])

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskInput.trim()) return
    const newTask: TaskItem = {
      id: Date.now().toString(),
      title: newTaskInput.trim(),
      completed: false,
      tag: 'Task',
      priority: 'Medium',
    }
    setTasks([newTask, ...tasks])
    setNewTaskInput('')
  }

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = statusFilter === 'all' || p.status === statusFilter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand-section">
          <div className="brand-icon-box">
            <Layers size={22} />
          </div>
          <div>
            <div className="brand-title">Management</div>
            <span className="brand-badge">ASP.NET + React</span>
          </div>
        </div>

        <nav className="nav-menu">
          <button
            id="nav-dashboard"
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button
            id="nav-projects"
            className={`nav-item ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <FolderKanban size={18} />
            <span>Projects</span>
          </button>

          <button
            id="nav-tasks"
            className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            <CheckSquare size={18} />
            <span>Tasks</span>
          </button>

          <button
            id="nav-team"
            className={`nav-item ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => setActiveTab('team')}
          >
            <Users size={18} />
            <span>Team</span>
          </button>

          <button
            id="nav-settings"
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="nav-footer">
          <div className="status-indicator">
            <span className="status-dot" style={{ background: backendStatus === 'online' ? '#10b981' : '#f59e0b' }}></span>
            <span>API {backendStatus === 'online' ? 'Connected' : 'Ready (:5266)'}</span>
          </div>
          <Activity size={16} color="#64748b" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-wrapper">
        {/* Top Header */}
        <header className="top-header">
          <div className="search-box">
            <Search size={16} color="#94a3b8" />
            <input
              id="global-search"
              type="text"
              className="search-input"
              placeholder="Search projects, tasks, members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="header-actions">
            <div className="status-indicator" style={{ background: 'rgba(255,255,255,0.04)', padding: '6px 12px', borderRadius: 9999 }}>
              <Server size={14} color="#818cf8" />
              <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>.NET 8.0 Core Backend</span>
            </div>
            <button
              id="btn-create-project"
              className="btn btn-primary"
              onClick={() => {
                const name = prompt('Enter Project Name:')
                if (name) {
                  const newProj: Project = {
                    id: `PRJ-${Math.floor(100 + Math.random() * 900)}`,
                    name,
                    category: 'Management',
                    owner: 'Current User',
                    progress: 10,
                    status: 'Active',
                    deadline: 'Dec 2026',
                  }
                  setProjects([newProj, ...projects])
                }
              }}
            >
              <Plus size={16} />
              <span>New Project</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          {/* Hero Banner */}
          <div className="page-hero">
            <div>
              <h1 className="hero-title">Overview & Operations</h1>
              <p className="hero-subtitle">Unified workspace connecting your ASP.NET Core service and React user interface.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['all', 'Active', 'In Progress', 'Completed'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`btn ${statusFilter === filter ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Metric Cards */}
          <section className="metrics-grid" aria-label="Key Performance Indicators">
            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-label">Total Projects</span>
                <div className="metric-icon" style={{ color: '#818cf8' }}>
                  <FolderKanban size={18} />
                </div>
              </div>
              <div className="metric-value">{projects.length}</div>
              <div className="metric-trend trend-up">
                <TrendingUp size={14} />
                <span>+18% from last cycle</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-label">Active Tasks</span>
                <div className="metric-icon" style={{ color: '#38bdf8' }}>
                  <CheckSquare size={18} />
                </div>
              </div>
              <div className="metric-value">{tasks.filter(t => !t.completed).length}</div>
              <div className="metric-trend" style={{ color: '#94a3b8' }}>
                <Clock size={14} />
                <span>{tasks.filter(t => t.completed).length} tasks completed</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-label">Core Services</span>
                <div className="metric-icon" style={{ color: '#34d399' }}>
                  <Server size={18} />
                </div>
              </div>
              <div className="metric-value">Operational</div>
              <div className="metric-trend trend-up">
                <CheckCircle2 size={14} />
                <span>ASP.NET Core 8.0 Online</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <span className="metric-label">Team Velocity</span>
                <div className="metric-icon" style={{ color: '#f472b6' }}>
                  <Sparkles size={18} />
                </div>
              </div>
              <div className="metric-value">94.2%</div>
              <div className="metric-trend trend-up">
                <ArrowUpRight size={14} />
                <span>+4.2% milestone completion</span>
              </div>
            </div>
          </section>

          {/* Full-Stack Architecture Integration Banner */}
          <div className="integration-banner">
            <div className="integration-content">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                <Server size={22} />
              </div>
              <div className="integration-text">
                <h4>Full-Stack Environment Configured</h4>
                <p>
                  Backend API: <span className="code-pill">http://localhost:5266</span> | Frontend Dev Server: <span className="code-pill">http://localhost:3000</span> (Vite Proxy enabled on <span className="code-pill">/api</span>)
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <span className="badge badge-active">React 18 + TS</span>
              <span className="badge badge-progress">ASP.NET 8.0 MVC</span>
            </div>
          </div>

          {/* Dashboard Two-Column Grid */}
          <div className="dashboard-grid">
            {/* Left: Project Management Table */}
            <section className="card-panel">
              <div className="panel-header">
                <h2 className="panel-title">Active Projects ({filteredProjects.length})</h2>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Live Workspace</span>
              </div>

              <div className="table-container">
                <table className="modern-table" id="projects-table">
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Category</th>
                      <th>Lead</th>
                      <th>Progress</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.map((project) => (
                      <tr key={project.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{project.name}</div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{project.id}</div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{project.category}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{project.owner}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 9999, overflow: 'hidden' }}>
                              <div
                                style={{
                                  height: '100%',
                                  width: `${project.progress}%`,
                                  background: project.progress === 100 ? '#10b981' : 'linear-gradient(90deg, #6366f1, #06b6d4)',
                                  borderRadius: 9999,
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8', width: 28 }}>{project.progress}%</span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              project.status === 'Active'
                                ? 'badge-active'
                                : project.status === 'In Progress'
                                ? 'badge-progress'
                                : project.status === 'Completed'
                                ? 'badge-active'
                                : 'badge-pending'
                            }`}
                          >
                            {project.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Right: Quick Tasks Checklist */}
            <section className="card-panel">
              <div className="panel-header">
                <h2 className="panel-title">Tasks Checklist</h2>
                <span style={{ fontSize: '0.85rem', color: '#818cf8' }}>
                  {tasks.filter(t => t.completed).length}/{tasks.length} done
                </span>
              </div>

              <form onSubmit={handleAddTask} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input
                  id="new-task-input"
                  type="text"
                  placeholder="Add a new task..."
                  value={newTaskInput}
                  onChange={(e) => setNewTaskInput(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 12px',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.85rem',
                  }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px' }}>
                  <Plus size={16} />
                </button>
              </form>

              <div className="task-list" id="task-list">
                {tasks.map((task) => (
                  <div key={task.id} className="task-item">
                    <div className="task-info">
                      <input
                        type="checkbox"
                        className="task-checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        id={`task-${task.id}`}
                      />
                      <div>
                        <div className={`task-title ${task.completed ? 'task-completed' : ''}`}>
                          {task.title}
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{task.tag}</span>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: task.priority === 'High' ? '#f43f5e' : task.priority === 'Medium' ? '#f59e0b' : '#10b981',
                      }}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App

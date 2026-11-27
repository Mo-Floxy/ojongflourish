import {
  Activity,
  Apple,
  Bell,
  Droplets,
  Flame,
  LayoutDashboard,
  MoonStar,
  Repeat2,
  Settings2,
  TrendingUp,
} from 'lucide-react'
import Button from '../Button.jsx'
import Reveal from '../Reveal.jsx'
import SectionHeading from '../SectionHeading.jsx'

const sidebar = [
  { icon: LayoutDashboard, label: 'Overview', active: true },
  { icon: Activity, label: 'Workouts' },
  { icon: Apple, label: 'Nutrition' },
  { icon: Droplets, label: 'Hydration' },
  { icon: Repeat2, label: 'Habits' },
  { icon: MoonStar, label: 'Sleep' },
]

const stats = [
  { icon: Flame, label: 'Active streak', value: '12 days', tone: 'amber' },
  { icon: Activity, label: 'This week', value: '5 sessions', tone: 'emerald' },
  { icon: Droplets, label: 'Hydration', value: '1.8 / 2.4 L', tone: 'blue' },
  { icon: MoonStar, label: 'Last night', value: '7h 20m', tone: 'violet' },
]

const bars = [42, 68, 50, 84, 62, 92, 74]
const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function DashboardPreview() {
  return (
    <section className="preview section" aria-labelledby="preview-title">
      <div className="container">
        <div className="preview__head">
          <SectionHeading
            eyebrow="A look ahead"
            title={
              <span id="preview-title">
                Your progress, <em>beautifully clear.</em>
              </span>
            }
            description="A glimpse of the personal dashboard coming in Phase 3. Every number below is demonstration data — not a real user account."
          />
          <Reveal delay={0.2}>
            <span className="demo-badge">DEMO DATA · ILLUSTRATIVE ONLY</span>
          </Reveal>
        </div>

        <Reveal className="dashboard-preview" delay={0.12}>
          <div className="dashboard-preview__chrome">
            <div className="dashboard-preview__dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <span>pulse.app/demo</span>
            <span className="dashboard-preview__chrome-tag">Sample view</span>
          </div>

          <div className="dashboard-preview__body">
            <aside className="dash-sidebar" aria-label="Sample dashboard navigation">
              <div className="dash-sidebar__brand">
                <span className="dash-sidebar__mark" aria-hidden="true">
                  <Activity size={16} />
                </span>
                PULSE
              </div>
              <div className="dash-sidebar__links">
                {sidebar.map((item) => (
                  <span
                    key={item.label}
                    className={`dash-sidebar__link ${item.active ? 'is-active' : ''}`}
                  >
                    <item.icon size={16} aria-hidden="true" />
                    {item.label}
                  </span>
                ))}
              </div>
              <div className="dash-sidebar__bottom">
                <Settings2 size={16} aria-hidden="true" /> Settings
              </div>
            </aside>

            <div className="dash-main">
              <div className="dash-main__top">
                <div>
                  <span className="dash-main__eyebrow">SAMPLE DASHBOARD</span>
                  <h3>Good morning, Alex.</h3>
                  <p>Here is how your sample week is shaping up.</p>
                </div>
                <div className="dash-main__top-actions">
                  <span className="dash-icon" aria-hidden="true"><Bell size={17} /></span>
                  <span className="dash-avatar" aria-hidden="true">A</span>
                </div>
              </div>

              <div className="dash-stats">
                {stats.map((stat) => (
                  <div className="dash-stat" key={stat.label}>
                    <span className={`dash-stat__icon dash-stat__icon--${stat.tone}`} aria-hidden="true">
                      <stat.icon size={17} />
                    </span>
                    <div>
                      <span>{stat.label}</span>
                      <strong>{stat.value}</strong>
                    </div>
                  </div>
                ))}
              </div>

              <div className="dash-panels">
                <div className="dash-panel dash-panel--chart">
                  <div className="dash-panel__head">
                    <div>
                      <h4>Weekly activity</h4>
                      <p>Sample minutes moved per day</p>
                    </div>
                    <span className="dash-panel__trend">
                      <TrendingUp size={14} aria-hidden="true" /> +24%
                    </span>
                  </div>
                  <div className="dash-chart" role="img" aria-label="Sample weekly activity chart">
                    {bars.map((height, index) => (
                      <div className="dash-chart__col" key={index}>
                        <div className="dash-chart__track">
                          <span style={{ height: `${height}%` }} />
                        </div>
                        <small>{days[index]}</small>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="dash-panel dash-panel--goals">
                  <div className="dash-panel__head">
                    <div>
                      <h4>Daily goals</h4>
                      <p>Sample progress</p>
                    </div>
                  </div>
                  <div className="dash-goal">
                    <div className="dash-goal__label"><span>Move</span><strong>84%</strong></div>
                    <div className="dash-progress"><span style={{ width: '84%' }} /></div>
                  </div>
                  <div className="dash-goal">
                    <div className="dash-goal__label"><span>Nourish</span><strong>72%</strong></div>
                    <div className="dash-progress dash-progress--lime"><span style={{ width: '72%' }} /></div>
                  </div>
                  <div className="dash-goal">
                    <div className="dash-goal__label"><span>Rest</span><strong>91%</strong></div>
                    <div className="dash-progress dash-progress--violet"><span style={{ width: '91%' }} /></div>
                  </div>
                  <div className="dash-goals-note">Sample data only</div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal className="preview__footer" delay={0.25}>
          <p>
            This preview is for demonstration purposes. No login, personal data or live tracking is
            included in Phase 1.
          </p>
          <Button to="/features/progress-analytics" variant="dark" size="sm">
            Explore analytics
          </Button>
        </Reveal>
      </div>
    </section>
  )
}

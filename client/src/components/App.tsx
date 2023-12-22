import Header from './header/Header'

function App() {
  return (
    <div className="relative overflow-hidden bg-white">
      <Header />
      <ul>
        <li>Status</li>
        <li>Name</li>
        <li>Check In Time</li>
      </ul>
      <ul>
        <li>
          <CustomerCard />
        </li>
        <li>
          <CustomerCard />
        </li>
        <li>
          <CustomerCard />
        </li>
        <li>
          <CustomerCard />
        </li>
      </ul>
    </div>
  )
}

function CustomerCard() {
  return (
    <div>
      <span>Served</span>
      <span>John Doe 1</span>
      <span>9:43 AM</span>
    </div>
  )
}

export default App

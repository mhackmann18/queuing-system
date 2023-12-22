import UserIcon from './UserIcon'

export default function Header() {
  return (
    <div>
      <svg
        className="h-6 w-6 text-gray-800 dark:text-white"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 17 14"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M1 1h15M1 7h15M1 13h15"
        />
      </svg>
      <h1>Driver&apos;s License Customers</h1>
      <UserIcon
        text="MV1"
        color="bg-blue-800"
        onClick={() => console.log('click')}
      />
    </div>
  )
}

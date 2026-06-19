import { Link } from 'react-router'

function MenuButton({ icon: Icon, label, to, onClick, active }) {
  return (
    <Link
    to={to}
    className={"flex justify-start items-center px-2 gap-1.5 w-full h-12 rounded-xl " + (active ? "bg-(--blue-color1) text-(--blue-color3) font-semibold" : "bg-(--bg-card-color) text-(--text-primary-color) hover:bg-(--bg-card-hover-color)")}
    onClick={onClick}
    >
        <Icon size={24} />
        <span>{label}</span>
    </Link>
  )
}

export default MenuButton

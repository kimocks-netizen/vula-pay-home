import navLight from "@/assets/nav-light-logo.png";
import navDark from "@/assets/nav-dark-logo.png";

export function Logo({ inverted = false }: { inverted?: boolean }) {
  if (inverted) {
    return (
      <span className="inline-flex items-center">
        <img src={navDark} alt="Vula Pay" className="h-8 w-auto" />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center">
      <img src={navLight} alt="Vula Pay" className="h-8 w-auto block dark:hidden" />
      <img src={navDark}  alt="Vula Pay" className="h-8 w-auto hidden dark:block" />
    </span>
  );
}

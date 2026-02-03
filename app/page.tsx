import { redirect } from "next/navigation";

export default function HomePage() {
  // Redirect to /conflicte for now
  // Later you can add a proper home page here
  redirect("/conflicte");
}

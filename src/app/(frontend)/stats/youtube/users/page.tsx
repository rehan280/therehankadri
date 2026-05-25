import { permanentRedirect } from "next/navigation";

export default function LegacyYouTubeUsersPage() {
  permanentRedirect("/stats/youtube-users");
}

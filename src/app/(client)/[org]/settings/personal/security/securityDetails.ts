type SecurityDetails = {
  action: string;
  device: string;
  location: string;
  date: string;
  lastActive: string;
};

export const securityDetails: SecurityDetails[] = [
  {
    action: "Sign In",
    device: "hp Explora",
    location: "Canada",
    date: "20 May 2025",
    lastActive: "10 minutes ago",
  },
  {
    action: "Password Update",
    device: "MacOS✅",
    location: "Nigeria",
    date: "18 May 2025",
    lastActive: "Current session",
  },
  {
    action: "Sign In",
    device: "iPhone 11",
    location: "Nigeria",
    date: "16 May 2025",
    lastActive: "1 second ago",
  },
  {
    action: "Email Update",
    device: "MacOS✅",
    location: "Nigeria",
    date: "15 May 2025",
    lastActive: "Current session",
  },
  {
    action: "Sign Up",
    device: "MacOS✅",
    location: "Nigeria",
    date: "12 May 2025",
    lastActive: "Current session",
  },
];

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home, { Admin } from "./pages/Home";

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><Switch><Route path="/" component={Home} /><Route path="/admin" component={Admin} /></Switch></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;

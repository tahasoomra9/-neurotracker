import React from 'react';
import { AppView, Theme } from '../../App';

const ProfileIcon = () => <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const DashboardIcon = () => <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const GoalsIcon = () => <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>;
const InsightsIcon = () => <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>;
const CoachIcon = () => <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2.5 12.5 10-10 10 10-10 10-10-10z"></path><path d="m12.5 2.5 10 10-10 10-10-10 10-10z"></path></svg>;
const SettingsIcon = () => <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const HelpIcon = () => <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const LogoutIcon = () => <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const SunIcon = () => <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2"></path><path d="M12 21v2"></path><path d="M4.22 4.22l1.42 1.42"></path><path d="M18.36 18.36l1.42 1.42"></path><path d="M1 12h2"></path><path d="M21 12h2"></path><path d="M4.22 19.78l1.42-1.42"></path><path d="M18.36 5.64l1.42-1.42"></path></svg>;
const MoonIcon = () => <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;


interface NavItemProps {
  icon?: React.ReactNode;
  label: string;
  isActive?: boolean;
  as?: 'a' | 'button';
  onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, as = 'a', onClick }) => {
  const commonClasses = `flex items-center w-full px-3 py-2.5 text-sm rounded-md transition-colors duration-200 ${
    isActive 
      ? 'bg-brand text-brand-foreground font-semibold shadow-lg shadow-brand/30' 
      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
  }`;
  
  const content = (
    <>
      {icon && <span className="w-6 flex justify-center items-center">{icon}</span>}
      <span className={icon ? "ml-3" : ""}>{label}</span>
    </>
  );

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    e.preventDefault();
    if (onClick) {
        onClick(e);
    }
  }

  if (as === 'button') {
    return (
      <button onClick={handleClick} className={commonClasses}>
        {content}
      </button>
    );
  }

  return (
    <a href="#" onClick={handleClick} className={commonClasses}>
      {content}
    </a>
  );
};

const NavGroupTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h4 className="px-3 text-xs font-semibold tracking-wider text-muted-foreground/60 uppercase mt-4 mb-2">
        {children}
    </h4>
)

interface SidebarProps {
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  theme: Theme;
  onToggleTheme: () => void;
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  onLoadDemoData: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, isOpen, setIsOpen, theme, onToggleTheme, activeView, onNavigate, onLoadDemoData }) => {
  return (
    <>
        {/* Overlay for mobile */}
        <div 
            className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsOpen(false)}
        ></div>

        <aside className={`fixed top-0 left-0 w-[200px] h-full bg-background/80 backdrop-blur-xl flex flex-col p-4 border-r border-border z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
            <div className="px-2 mb-8">
                <h1 className="text-xl font-logo font-semibold text-foreground tracking-wider">
                    <span className="text-brand">//</span> neurotracker
                </h1>
            </div>
        
            <nav className="flex-1 flex flex-col gap-1">
                <NavItem icon={<DashboardIcon />} label="Dashboard" isActive={activeView === 'dashboard'} onClick={() => onNavigate('dashboard')} />
                
                <NavGroupTitle>Track</NavGroupTitle>
                <NavItem icon={<GoalsIcon />} label="Goals" isActive={activeView === 'goals'} onClick={() => onNavigate('goals')} />
                
                <NavGroupTitle>Analyze</NavGroupTitle>
                <NavItem icon={<InsightsIcon />} label="Insights" isActive={activeView === 'insights'} onClick={() => onNavigate('insights')} />
                <NavItem icon={<CoachIcon />} label="AI Coach" />

                <NavGroupTitle>Account</NavGroupTitle>
                <NavItem icon={<ProfileIcon />} label="Profile" />
                <NavItem icon={<SettingsIcon />} label="Settings" />
                <NavItem as="button" onClick={onToggleTheme} icon={theme === 'dark' ? <SunIcon/> : <MoonIcon/>} label={theme === 'dark' ? "Light Mode" : "Dark Mode"} />
            </nav>

            <div className="mt-auto flex flex-col gap-1">
                <NavItem as="button" onClick={onLoadDemoData} label="Load Demo" />
                <hr className="border-border my-2" />
                <NavItem icon={<HelpIcon />} label="Help" />
                <NavItem as="a" onClick={(e) => { e.preventDefault(); onLogout(); }} icon={<LogoutIcon />} label="Logout" />
            </div>
        </aside>
    </>
  );
};

export default Sidebar;
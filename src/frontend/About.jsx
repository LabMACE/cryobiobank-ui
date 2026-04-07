import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LanguageIcon from '@mui/icons-material/Language';

export default function About({ sectionsRef }) {
  return (
    <section
      className="section about-section"
      data-section="about"
      ref={(el) => (sectionsRef.current[2] = el)}
    >
      <div className="about-card distinct-about-card">
        <div className="about-body">
          <List dense sx={{ pl: 1, mb: 1 }}>
            <ListItem disableGutters sx={{ py: 0.3 }}>
              <Link
                href="https://www.epfl.ch/labs/mace/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ fontSize: '1rem' }}
              >
                MACE – Microbiome Adaptation to the Changing Environment
              </Link>
            </ListItem>
            <ListItem disableGutters sx={{ py: 0.3 }}>
              <Link
                href="https://www.epfl.ch"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ fontSize: '1rem' }}
              >
                EPFL – École polytechnique fédérale de Lausanne
              </Link>
            </ListItem>
            <br />
            <ListItem
              disableGutters
              sx={{ py: 0.3, display: 'flex', alignItems: 'center' }}
            >
              <Typography variant="body2" sx={{ fontSize: '1rem', mr: 0.5 }}>
                Development: Evan Thomas
              </Typography>
              <Link
                href="https://github.com/evanjt"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ ml: 0.5 }}
              >
                <GitHubIcon sx={{ fontSize: '1rem', color: '#90caf9' }} />
              </Link>
              <Link
                href="https://www.linkedin.com/in/evanjt"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ ml: 0.5 }}
              >
                <LinkedInIcon sx={{ fontSize: '1rem', color: '#90caf9' }} />
              </Link>
              <Link
                href="https://evanjt.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ ml: 0.5 }}
              >
                <LanguageIcon sx={{ fontSize: '1rem', color: '#90caf9' }} />
              </Link>
            </ListItem>
          </List>
        </div>
      </div>

      <footer className="footer">
        <p className="footer-attribution">
          &copy; {new Date().getFullYear()} CryoBioBank.{' '}
          <a
            href="https://www.epfl.ch/labs/mace/"
            target="_blank"
            rel="noopener noreferrer"
          >
            MACE EPFL
          </a>
        </p>
        <a href="/admin" className="footer-lemon" title="Go to Admin">
          🍋
        </a>
      </footer>
    </section>
  );
}

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
          <Typography
            variant="body1"
            paragraph
            sx={{ fontSize: '1rem', mb: 1.5, lineHeight: 1.6, textAlign: 'justify' }}
          >
            CryoBioBank is a platform for managing and exploring biological samples
            collected from Swiss alpine cryosphere environments. The database stores
            isolates, samples, and DNA extractions from snow and soil sites across
            the Swiss Alps, supporting research into cold-adapted microbial communities.
          </Typography>

          <Typography
            variant="h6"
            component="h3"
            sx={{ mt: 2, mb: 0.75, fontWeight: 600 }}
          >
            About the project
          </Typography>
          <Typography
            variant="body1"
            paragraph
            sx={{ fontSize: '1rem', mb: 1.5, lineHeight: 1.6, textAlign: 'justify' }}
          >
            Sampling campaigns collect snow and soil specimens from alpine sites.
            Organisms are isolated, identified, and preserved for further study.
            DNA extractions enable genomic analysis of cryosphere biodiversity.
            This platform provides public access to metadata about our collections.
          </Typography>

          <Typography
            variant="h6"
            component="h3"
            sx={{ mt: 2, mb: 0.75, fontWeight: 600 }}
          >
            Attribution
          </Typography>

          <List dense sx={{ pl: 1, mb: 1 }}>
            <ListItem disableGutters sx={{ py: 0.3 }}>
              <Link
                href="https://www.epfl.ch/labs/mace/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ fontSize: '1rem' }}
              >
                MACE – Microbial ecology of Alpine Cryosphere Environments
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

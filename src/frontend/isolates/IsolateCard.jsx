import { Link } from 'react-router-dom';
import { DnaIcon, MapIcon } from './illustrations';
import PhotoHoverIcon from './PhotoHoverIcon';

export default function IsolateCard({ isolate, enrichment, onOpen }) {
  const rep = enrichment.replicates[isolate.site_replicate_id];
  const site = rep ? enrichment.sites[rep.site_id] : null;
  const area = site?.area_id ? enrichment.areas[site.area_id] : null;
  const habitat = (rep?.sample_type || 'unknown').toLowerCase();

  return (
    <article
      className={`isodir-card habitat-${habitat}`}
      onClick={() => onOpen(isolate)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(isolate); } }}
      tabIndex={0}
      role="button"
      aria-label={`Open ${isolate.name}`}
    >
      <div className="isodir-card-head">
        <span className="isodir-card-name">{isolate.name}</span>
        {rep?.sample_type && <span className="isodir-card-habitat">{rep.sample_type}</span>}
      </div>
      <div className="isodir-card-tax">
        {isolate.taxonomy || <span className="isodir-muted">Unidentified</span>}
      </div>
      <dl className="isodir-card-meta">
        {site?.name && (
          <MetaRow label="Site" value={site.name + (area?.name ? ` · ${area.name}` : '')} />
        )}
        {site?.elevation_metres != null && (
          <MetaRow label="Elev" value={`${Math.round(site.elevation_metres)} m`} />
        )}
        {isolate.temperature_of_isolation != null && (
          <MetaRow label="Temp" value={`${isolate.temperature_of_isolation} °C`} />
        )}
        {isolate.media_used_for_isolation && (
          <MetaRow label="Media" value={isolate.media_used_for_isolation} />
        )}
      </dl>
      <div className="isodir-card-foot">
        <div className="isodir-card-flags">
          <PhotoHoverIcon isolate={isolate} size={15} />
          {isolate.genome_url && (
            <a
              href={isolate.genome_url}
              target="_blank"
              rel="noopener noreferrer"
              className="isodir-flag is-link"
              onClick={(e) => e.stopPropagation()}
              title="Genome"
            >
              <DnaIcon size={15} />
            </a>
          )}
        </div>
        {site?.id && (
          <Link
            to={`/?focus_site=${site.id}&replicate=${rep.id}&isolate=${isolate.id}&from=isolates`}
            className="isodir-card-mapbtn"
            onClick={(e) => e.stopPropagation()}
            title="View on map"
            aria-label="View on map"
          >
            <MapIcon size={15} />
          </Link>
        )}
      </div>
    </article>
  );
}

function MetaRow({ label, value }) {
  return (
    <div className="isodir-meta-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

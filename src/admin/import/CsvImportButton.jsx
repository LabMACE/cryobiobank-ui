import { useState } from 'react';
import { Button } from 'react-admin';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileImport } from '@fortawesome/free-solid-svg-icons';
import { CsvImportWizard } from './CsvImportWizard';
import { IMPORT_CONFIGS } from './csvImportConfig';

export function CsvImportButton({ resource }) {
    const [open, setOpen] = useState(false);

    if (!IMPORT_CONFIGS[resource]) return null;

    return (
        <>
            <Button
                label="Import CSV"
                onClick={() => setOpen(true)}
            >
                <FontAwesomeIcon icon={faFileImport} />
            </Button>
            <CsvImportWizard
                open={open}
                onClose={() => setOpen(false)}
                resource={resource}
            />
        </>
    );
}

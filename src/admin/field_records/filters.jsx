import {
    TextInput,
    SelectInput,
    NumberInput,
    ReferenceInput,
} from 'react-admin';
import { NUMERIC_FIELDS, sampleTypeChoices } from './filterFields';

const privacyChoices = [
    { id: true, name: 'Private' },
    { id: false, name: 'Public' },
];

const expandRange = ({ source, label, group }) => {
    const prefix = group ? `${group}: ` : '';
    return [
        <NumberInput key={`${source}_gte`} source={`${source}_gte`} label={`${prefix}${label} ≥`} />,
        <NumberInput key={`${source}_lte`} source={`${source}_lte`} label={`${prefix}${label} ≤`} />,
    ];
};

const numericRangeFilters = NUMERIC_FIELDS.flatMap(expandRange);

// Kept small: the daily-driver filters are always visible; everything else lives in
// the "Add filter" menu. `is_private` is admin-only, so the factory takes permissions.
export const fieldRecordFilters = (permissions) => [
    <TextInput key="q" source="q" label="Search" alwaysOn />,
    <SelectInput
        key="sample_type"
        source="sample_type"
        label="Sample Type"
        choices={sampleTypeChoices}
        alwaysOn
    />,
    <ReferenceInput key="site_id" source="site_id" reference="sites" alwaysOn>
        <SelectInput optionText="name" label="Site" />
    </ReferenceInput>,
    <TextInput key="name_like" source="name_like" label="Name contains" />,
    ...(permissions === 'admin'
        ? [
              <SelectInput
                  key="is_private"
                  source="is_private"
                  label="Privacy"
                  choices={privacyChoices}
              />,
          ]
        : []),
    ...numericRangeFilters,
];

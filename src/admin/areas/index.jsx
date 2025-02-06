import CreateComponent from './Create';
import EditComponent from './Edit';
import ListComponent from './List';
import ShowComponent from './Show';
// import ScienceIcon from '@mui/icons-material/Science';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';

export default {
    create: CreateComponent,
    edit: EditComponent,
    list: ListComponent,
    show: ShowComponent,
    // icon: ScienceIcon,
    icon: () => <FontAwesomeIcon icon={faLayerGroup} />,
    options: {
        label: 'Areas',
    },
};

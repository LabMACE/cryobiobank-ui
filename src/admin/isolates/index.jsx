import CreateComponent from './Create';
import EditComponent from './Edit';
import ListComponent from './List';
import ShowComponent from './Show';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBacteria } from '@fortawesome/free-solid-svg-icons';

export default {
    create: CreateComponent,
    edit: EditComponent,
    list: ListComponent,
    show: ShowComponent,
    icon: () => <FontAwesomeIcon icon={faBacteria} />,
    options: {
        label: 'Isolates',
    },
};

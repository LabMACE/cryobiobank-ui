import {
    List,
    Datagrid,
    TextField,
    useRecordContext,
    useCreatePath,
    ReferenceManyCount,
    usePermissions,
    BulkDeleteButton,
    Loading,
} from "react-admin";
import { Link } from 'react-router-dom';
import { ListActionsByPermission } from '../custom/Toolbars';


// const PostPanel = () => {
//     const record = useRecordContext();
//     const createPath = useCreatePath();
//     const objectClick = (id, resource, record) => (
//         createPath({ resource: 'site_replicates', type: 'show', id: record.id })
//     );
//     // Get sorted replicate list
//     const replicates = record.replicates.sort((a, b) => {
//         return new Date(a.sampling_date) - new Date(b.sampling_date);
//     });

//     return (
//         <table>
//             <thead>
//                 <tr>
//                     <th style={{ paddingRight: '20px' }}>Date</th>
//                     <th style={{ paddingRight: '20px' }}>Sample Type</th>
//                 </tr>
//             </thead>
//             <tbody>
//                 {replicates.map((replicate, index) => (
//                     <tr key={index}>
//                         <td style={{ paddingRight: '20px' }}>
//                             <Link to={objectClick(replicate.id, 'site_replicates', replicate)}>{replicate.sampling_date}</Link>
//                         </td>
//                         <td style={{ paddingRight: '20px' }}>
//                             {replicate.sample_type}
//                         </td>
//                     </tr>
//                 ))}
//             </tbody>
//         </table>
//     );
// };

const ListComponent = () => {
    const { permissions, isLoading } = usePermissions();
    if (isLoading) return <Loading />;
    
    return (
        <List disableSyncWithLocation
            perPage={25}
            sort={{ field: 'name', order: 'ASC' }}
            actions={<ListActionsByPermission />}
        >
            <Datagrid 
                rowClick="show" 
                // expand={<PostPanel />} 
                bulkActionButtons={permissions === 'admin' ? <BulkDeleteButton mutationMode="pessimistic" /> : false}
            >
                <TextField source="name" />
                <TextField source="latitude_4326" label="Latitude (°)" />
                <TextField source="longitude_4326" label="Longitude (°)" />
                <TextField source="elevation_metres" label="Elevation (m)" />
                <ReferenceManyCount reference="site_replicates" target="site_id" label="Replicates" />
            </Datagrid>
        </List >

    )
};

export default ListComponent;

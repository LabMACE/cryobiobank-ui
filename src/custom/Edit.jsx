import { Edit as ReactAdminEdit } from "react-admin";

const CustomEdit = ReactAdminEdit;

CustomEdit.defaultProps = {
    undoable: false,
};

export default CustomEdit;
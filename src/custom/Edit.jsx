import { Edit as ReactAdminEdit } from "react-admin";

const Edit = ReactAdminEdit;

Edit.defaultProps = {
    undoable: false,
};

export default Edit;
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { listAdminUsers, deleteUser } from '../../actions/adminActions';

const UserList = () => {
  const dispatch = useDispatch();

  const adminUserList = useSelector((state) => state.adminUserList);
  const { loading, error, users } = adminUserList;

  const userDelete = useSelector((state) => state.userDelete);
  const { success: successDelete } = userDelete;

  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      dispatch(listAdminUsers());
    }
  }, [dispatch, userInfo, successDelete]);

  const deleteHandler = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUser(id));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-brown-900 mb-6">Users</h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brown-500"></div>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-brown-200">
              <thead className="bg-brown-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brown-700 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brown-700 uppercase tracking-wider">
                    NAME
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brown-700 uppercase tracking-wider">
                    EMAIL
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brown-700 uppercase tracking-wider">
                    ADMIN
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-brown-700 uppercase tracking-wider">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-brown-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-brown-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-700">
                      {user._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brown-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-700">
                      <a href={`mailto:${user.email}`} className="text-brown-700 hover:text-brown-900">
                        {user.email}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brown-700">
                      {user.isAdmin ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Admin
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-brown-100 text-brown-800">
                          Customer
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/admin/user/${user._id}/edit`}
                        className="btn btn-light mr-2"
                      >
                        <i className="fas fa-edit"></i>
                      </Link>
                      <button
                        className="btn btn-danger"
                        onClick={() => deleteHandler(user._id)}
                        disabled={user._id === userInfo._id}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
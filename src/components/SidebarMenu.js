import React, { Component } from 'react';
import { Sidebar, Menu, MenuItem, SubMenu, menuClasses } from 'react-pro-sidebar';
import { MdHome } from 'react-icons/md';
import { BsFillBusFrontFill } from 'react-icons/bs';
import { BsFillTaxiFrontFill } from 'react-icons/bs';
import { GrBike } from 'react-icons/gr';
import { FiSettings } from 'react-icons/fi';
import { TbLayoutSidebarLeftCollapse, TbLayoutSidebarRightCollapse } from 'react-icons/tb';
import './SidebarMenu.css';
import ReactModal from 'react-modal';
import Config from './Config';
import 'bootstrap/dist/css/bootstrap.min.css'; // Importa los estilos de Bootstrap

import { WebCamLayout } from './MapLayouts/WebCamLayout';

import * as BaseMapFunctions from './BaseMap/BaseMapFunctions'

ReactModal.setAppElement('#root'); // Debes ajustar esto al elemento raíz de tu aplicación

class SidebarMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSidebarVisible: true,
      isConfigOpen: false,
    };
  }

  // Función para abrir el modal
  openConfig = () => {
    this.setState({ isConfigOpen: true });
  };

  // Función para cerrar el modal
  closeConfig = () => {
    this.setState({ isConfigOpen: false });
  };

  render() { 
    const { isSidebarVisible, isConfigOpen } = this.state;
    const { viewer } = this.props;

    return (
      <div>
        <button onClick={this.toggleSidebarVisibility} className="toggle-button">
          {isSidebarVisible ? <TbLayoutSidebarLeftCollapse /> : <TbLayoutSidebarRightCollapse />}
        </button>

        {isSidebarVisible && (
          <Sidebar className="bg-light" style={{ width: '300px' }} >
            <Menu
              rootStyles={{
                [`.${menuClasses.icon}`]: {
                  backgroundColor: '#e1e1e1',
                  color: '#344cff',
                },
              }}
              menuItemStyles={{
                button: ({ level, active, disabled }) => {
                  if (level === 0)
                    return {
                      color: disabled ? '#f5d9ff' : '#d359ff',
                      backgroundColor: active ? '#eecef9' : undefined,
                    };
                },
              }}
            >
              <MenuItem
                icon={<MdHome />}
                active
              >
                Home
              </MenuItem>
              <SubMenu
                label="Transportes"
                defaultOpen
              >
                <MenuItem
                  icon={<BsFillBusFrontFill />}
                >
                  Autobús
                </MenuItem>
                <MenuItem
                  disabled
                  icon={<BsFillTaxiFrontFill />}
                >
                  Taxi
                </MenuItem>
                <MenuItem
                  icon={<GrBike />}
                >
                  Bicicleta
                </MenuItem>
                <MenuItem
                  icon={<GrBike />}
                >
                  Tráfico
                </MenuItem>
              </SubMenu>

              <SubMenu
                label="Video"
                defaultOpen
              >
                <MenuItem
                  icon={<BsFillBusFrontFill />}
                  onClick={() => BaseMapFunctions.showWebcam(viewer)}                 
                >
                  Web Cam
                </MenuItem>
              </SubMenu >

              <MenuItem
                icon={<FiSettings />}
                onClick={this.openConfig}
              >
                Configuración
              </MenuItem>
              
            </Menu>

            {/* Modal */}
            <Config
              show={isConfigOpen}
              onHide={this.closeConfig}
            />
          </Sidebar>
        )}
      </div>
    );
  }
}

export default SidebarMenu;

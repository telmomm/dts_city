import React, { Component } from 'react';
import { Modal, Button, Tab, Tabs, Form, Row, Col, InputGroup } from 'react-bootstrap';

class Config extends Component {
  constructor(props) {
    super(props);
    this.state = {
      key: 'tab1',
      config: {
        email: '',
        password: '',
        servertoken:'',
        iontoken:'',
        opensky_username:'',
        opensky_password:'',
        city:''
        // Otras variables de configuración
      },
      isDirty: false, //Variable to control non save changes
    };
  }

  getConfigServiceToken = () => process.env.REACT_APP_CONFIG_SERVICE_TOKEN;

  // Agrega una función para cargar los archivos desde la URL con autenticación
  loadFilesFromURL = async (url, token) => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          // Agrega encabezados de autenticación si es necesario
          Authorization: 'Bearer ' + token,
        },
      });

      if (response.ok) {
        // Si la respuesta es exitosa, convierte la respuesta en JSON
        const data = await response.json();

        // Actualiza el estado con los datos cargados
        this.setState({ config: data });
      } else {
        console.error('Error al cargar los archivos desde la URL');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Agrega una función para guardar los archivos JSON con las modificaciones realizadas
  saveFilesToURL = async (url, token) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Agrega encabezados de autenticación si es necesario
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify(this.state.config),
      });

      if (response.ok) {
        // Si la respuesta es exitosa, muestra un mensaje de éxito
        console.log('Datos guardados con éxito en la URL');
      } else {
        console.error('Error al guardar los archivos en la URL');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  handleInputChange = (event) => {
    const { name, value } = event.target;

    this.setState((prevState) => ({
      config: {
        ...prevState.config,
        [name]: value,
      },
      isDirty: true,
    }));
  };

  // Función para cerrar el modal con confirmación de cambios no guardados
  handleClose = () => {
    if (this.state.isDirty) {
      const confirmClose = window.confirm('¿Desea cerrar sin guardar los cambios?');
      if (confirmClose) {
        this.props.onHide(); // Cierra el modal sin guardar
      }
    } else {
      this.props.onHide(); // Cierra el modal sin confirmación si no hay cambios
    }
  };

  saveConfigToJson = () => {
    // Agregar la fecha actual a la configuración antes de guardarla
    const updatedConfig = {
      ...this.state.config,
      lastUpdated: new Date().toISOString(), // Agregar la fecha actual en formato ISO
    };

    // Actualizar el estado con la configuración actualizada
    this.setState({ config: updatedConfig });

    const configServiceToken = this.getConfigServiceToken();
    if (!configServiceToken) {
      console.warn('Missing REACT_APP_CONFIG_SERVICE_TOKEN; omitting remote save.');
      this.props.onHide();
      return;
    }

    // Guardar los archivos en la URL con las modificaciones realizadas
    this.saveFilesToURL(
      'http://localhost:3000/config',
      configServiceToken
    );

    // Cerrar el modal
    this.props.onHide();
  };

  setCurrentView = () => {
    this.props.onHide();
  }

  componentDidUpdate(prevProps) {
    // Llama a la función para cargar archivos desde la URL cuando el componente se actualiza
    if (this.props.show !== prevProps.show) {
      const configServiceToken = this.getConfigServiceToken();
      if (!configServiceToken) {
        console.warn('Missing REACT_APP_CONFIG_SERVICE_TOKEN; omitting config load.');
        return;
      }
      this.loadFilesFromURL(
        //'http://localhost:3000/config',
        'https://dts-server.onrender.com/config',
        configServiceToken
      );
    }
  }

  render() {
    return (
      <Modal show={this.props.show} onHide={this.handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Configuración</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Contenido del modal con pestañas */}
          <Tabs
            id="config-tabs"
            activeKey={this.state.key}
            onSelect={(key) => this.setState({ key })}
          >
            {/* Pestaña 1 */}
            <Tab eventKey="tab1" title="General">
              <Modal.Body>
                
                <Form>
                  <Form.Group >
                  <Form.Label>Ciudad</Form.Label>
                    <Form.Control
                        type="text"
                        name="city"
                        placeholder="Ingrese el nombre de la ciudad"
                        value={this.state.config.city}
                        onChange={this.handleInputChange}
                      />
                      <Form.Label>Vista Inicial</Form.Label>
                  </Form.Group>
                  <Button variant="primary" onClick={this.setCurrentView}>
                        Establecer Vista Inicial
                      </Button>

                  <Form.Group>
                    
                  </Form.Group>
                </Form>
              </Modal.Body>
            </Tab>

            {/* Pestaña 2 */}
            <Tab eventKey="tab2" title="APIs">
            <Modal.Body>
                <Form>
                  <Form.Group>
                    <Form.Label>Server Token</Form.Label>
                    <Form.Control
                      type="servertoken"
                      name="servertoken"
                      placeholder="Token del servidor"
                      value={this.state.config.servertoken}
                      onChange={this.handleInputChange}
                    />
                    <Form.Label>ION Token (Cesium)</Form.Label>
                    <Form.Control
                      type="iontoken"
                      name="iontoken"
                      placeholder="Token de ION"
                      value={this.state.config.iontoken}
                      onChange={this.handleInputChange}
                    />
                    <Form.Label>OpenSky Credentials</Form.Label>    
                    <Row className="align-items-center">
                      <Col sm={6} className="my-1">
                        <Form.Label htmlFor="inlineFormInputName" visuallyHidden>
                          Username
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text>@</InputGroup.Text>
                          <Form.Control
                            type="username"
                            name="opensky_username"
                            placeholder="OpenSky Username"
                            value={this.state.config.opensky_username}
                            onChange={this.handleInputChange}
                          />
                        </InputGroup>
                      </Col>
                      <Col sm={6} className="my-1">
                        <Form.Label htmlFor="inlineFormInputGroupUsername" visuallyHidden>
                          Password
                        </Form.Label>
                        <InputGroup>
                          <InputGroup.Text>#</InputGroup.Text>
                          <Form.Control
                            type="password"
                            name="opensky_password"
                            placeholder="OpenSky Password"
                            value={this.state.config.opensky_password}
                            onChange={this.handleInputChange}
                          />
                        </InputGroup>
                      </Col>
                    </Row>
                  </Form.Group>
                </Form>
              </Modal.Body>
            </Tab>

          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.handleClose}>
            Cerrar
          </Button>
          <Button variant="primary" onClick={this.saveConfigToJson}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default Config;

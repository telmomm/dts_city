import axios from 'axios';

// Función para actualizar el archivo JSON en GitHub
export const updateConfig = async (accessToken, repositoryOwner, repositoryName, branchName, filePath, content, currentSHA) => {
  try {
    const url = `https://api.github.com/repos/${repositoryOwner}/${repositoryName}/contents/${filePath}`;
    
    // Intenta obtener la última versión del archivo
    const existingFileResponse = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (existingFileResponse.status === 200) {
      // Si se obtiene correctamente, obtén el SHA actual
      const existingSHA = existingFileResponse.data.sha;

      // Si el SHA actual y el SHA proporcionado son diferentes, hay un conflicto.
      if (existingSHA !== currentSHA) {
        // Realiza un pull para obtener la última versión del archivo
        const pullResponse = await axios.get(`${url}?ref=${branchName}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (pullResponse.status === 200) {
          // Obtén el contenido del archivo actualizado después del pull
          const updatedContent = pullResponse.data.content;
          const decodedUpdatedContent = atob(updatedContent);

          // Realiza la actualización del archivo con el nuevo contenido y el SHA actualizado
          const updateResponse = await axios.put(url, {
            message: 'Actualización del archivo JSON',
            content: btoa(JSON.stringify(content, null, 2)),
            branch: branchName,
            sha: pullResponse.data.sha, // Utiliza el nuevo SHA después del pull
          }, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (updateResponse.status === 200) {
            console.log('Archivo JSON actualizado en GitHub.');
          } else {
            console.error('Error al actualizar el archivo JSON en GitHub:', updateResponse.statusText);
          }
        } else {
          console.error('Error al realizar el pull desde GitHub:', pullResponse.statusText);
        }
      } else {
        // Si el SHA es el mismo, no hay conflicto, simplemente actualiza el archivo.
        const response = await axios.put(url, {
          message: 'Actualización del archivo JSON',
          content: btoa(JSON.stringify(content, null, 2)),
          branch: branchName,
          sha: currentSHA, // Utiliza el SHA proporcionado
        }, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.status === 200) {
          console.log('Archivo JSON actualizado en GitHub.');
        } else {
          console.error('Error al actualizar el archivo JSON en GitHub:', response.statusText);
        }
      }
    } else {
      console.error('Error al obtener el archivo JSON desde GitHub:', existingFileResponse.statusText);
    }
  } catch (error) {
    console.error('Error al actualizar el archivo JSON en GitHub:', error);
  }
};

// Función para cargar la configuración desde un archivo JSON en GitHub
export const loadConfigFromGitHub = async (accessToken, repositoryOwner, repositoryName, branchName, filePath) => {
    try {
      const response = await axios.get(
        `https://api.github.com/repos/${repositoryOwner}/${repositoryName}/contents/${filePath}?ref=${branchName}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      if (response.status === 200) {
        const content = response.data.content;
        const decodedContent = atob(content);
        const data = JSON.parse(decodedContent);
        const sha = response.data.sha;
  
        return { data, sha };
      } else {
        console.error('Error al cargar el archivo JSON desde GitHub:', response.statusText);
        throw new Error('Error al cargar el archivo JSON desde GitHub');
      }
    } catch (error) {
      console.error('Error al cargar el archivo JSON desde GitHub:', error);
      throw error;
    }
  };
// Ejemplo de uso en otro lugar de tu código
const accessToken = 'TU_TOKEN_DE_ACCESO_PERSONAL';
const repositoryOwner = 'NOMBRE_DEL_PROPIETARIO_DEL_REPOSITORIO';
const repositoryName = 'NOMBRE_DEL_REPOSITORIO';
const branchName = 'NOMBRE_DE_LA_RAMA';
const filePath = 'ruta/al/archivo.json';

loadConfigFromGitHub(accessToken, repositoryOwner, repositoryName, branchName, filePath)
  .then(({ data, sha }) => {
    // Aquí puedes utilizar los datos cargados desde el archivo JSON y el SHA
    console.log('Datos cargados desde GitHub:', data);
    console.log('SHA del archivo:', sha);
  })
  .catch((error) => {
    // Manejar errores si ocurre alguno
    console.error('Error al cargar los datos desde GitHub:', error);
  });
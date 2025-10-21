import * as FileSystem from 'expo-file-system';

/**
 * The single, shared directory for all downloadable assets.
 * Both AR and 3D components will save files here.
 */
export const SHARED_ASSETS_DIR = FileSystem.documentDirectory + 'shared_assets/';

/**
 * A helper function to get a clean filename from any URL.
 * @param {string} url The remote URL of the file.
 * @returns {string} The extracted filename.
 */
export const getFilenameFromUrl = (url) => {
    if (!url) return '';
    return decodeURIComponent(url.split('/').pop().split('?')[0]);
};

/**
 * A helper to create a filesystem-safe directory name from a landmark title.
 * @param {string} name The name of the landmark.
 * @returns {string} A safe string to use as a folder name.
 */
export const getSafeDirName = (name) => {
    if (!name) return 'default';
    return name.replace(/[^a-zA-Z0-9]/g, '_');
};
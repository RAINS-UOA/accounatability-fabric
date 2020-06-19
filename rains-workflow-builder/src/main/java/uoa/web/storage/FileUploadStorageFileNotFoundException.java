package uoa.web.storage;

public class FileUploadStorageFileNotFoundException extends FileUploadStorageException {

	public FileUploadStorageFileNotFoundException(String message) {
		super(message);
	}

	public FileUploadStorageFileNotFoundException(String message, Throwable cause) {
		super(message, cause);
	}
}

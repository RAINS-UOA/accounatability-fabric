package uoa.model.components;

public class SystemDetails {

	public String iri;
	public String label;
	public String description;
	
	

    public SystemDetails (String systemIR) {
    	setIri(systemIR);
	}
	
    
	
	public String getIri() {
	    return iri;
	  }

	  public void setIri(String iri) {
	    this.iri = iri;
	  }

	  public String getDescription() {
	    return description;
	  }

	  public void setDescription(String description) {
	    this.description = description;
	  }
	  
	  public String getLabel() {
		    return label;
		  }

	  public void setLabel(String label) {
		   this.label = label;
		  }
	
	
	
	
}
